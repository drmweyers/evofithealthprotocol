import autocannon from 'autocannon';
import { spawn } from 'child_process';
import chalk from 'chalk';

interface TestResult {
  endpoint: string;
  requests: number;
  duration: number;
  latency: {
    p50: number;
    p90: number;
    p99: number;
  };
  throughput: number;
  errors: number;
  timeouts: number;
}

class PerformanceTestRunner {
  private baseUrl: string;
  private authToken: string | null = null;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3500') {
    this.baseUrl = baseUrl;
  }

  // Authenticate and get token
  async authenticate() {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'trainer.test@evofitmeals.com',
          password: 'TestTrainer123!'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.token;
        console.log(chalk.green('✓ Authentication successful'));
      } else {
        console.error(chalk.red('✗ Authentication failed'));
      }
    } catch (error) {
      console.error(chalk.red('✗ Authentication error:'), error);
    }
  }

  // Run load test on specific endpoint
  async runLoadTest(
    path: string,
    options: {
      connections?: number;
      duration?: number;
      pipelining?: number;
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<TestResult> {
    const {
      connections = 10,
      duration = 30,
      pipelining = 1,
      method = 'GET',
      body,
      headers = {}
    } = options;

    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      
      console.log(chalk.blue(`\n📊 Testing ${method} ${path}`));
      console.log(chalk.gray(`Connections: ${connections}, Duration: ${duration}s, Pipelining: ${pipelining}`));

      const instance = autocannon({
        url,
        connections,
        duration,
        pipelining,
        method,
        headers: {
          ...headers,
          ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      }, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        const testResult: TestResult = {
          endpoint: path,
          requests: result.requests.total,
          duration: result.duration,
          latency: {
            p50: result.latency.p50,
            p90: result.latency.p90,
            p99: result.latency.p99
          },
          throughput: result.throughput.total,
          errors: result.errors,
          timeouts: result.timeouts
        };

        this.results.push(testResult);
        resolve(testResult);
      });

      // Show progress
      autocannon.track(instance, {
        renderProgressBar: true,
        renderResultsTable: true
      });
    });
  }

  // Test critical endpoints
  async testCriticalEndpoints() {
    console.log(chalk.cyan('\n🚀 Starting Performance Test Suite\n'));

    // Test authentication endpoint
    await this.runLoadTest('/api/auth/login', {
      method: 'POST',
      duration: 10,
      connections: 5,
      body: {
        email: 'trainer.test@evofitmeals.com',
        password: 'TestTrainer123!'
      },
      headers: { 'Content-Type': 'application/json' }
    });

    // Authenticate for protected endpoints
    await this.authenticate();

    // Test health protocols listing
    await this.runLoadTest('/api/health-protocols', {
      duration: 20,
      connections: 10
    });

    // Test protocol generation (lower load due to AI calls)
    await this.runLoadTest('/api/health-protocols/generate', {
      method: 'POST',
      duration: 10,
      connections: 2,
      body: {
        ailments: ['Lower Back Pain', 'Poor Posture'],
        duration: 30
      },
      headers: { 'Content-Type': 'application/json' }
    });

    // Test customer progress endpoint
    await this.runLoadTest('/api/trainer/customers/progress', {
      duration: 15,
      connections: 8
    });

    // Test recipe search
    await this.runLoadTest('/api/recipes/search?query=protein', {
      duration: 15,
      connections: 10
    });

    // Test static assets
    await this.runLoadTest('/', {
      duration: 20,
      connections: 20,
      pipelining: 4
    });
  }

  // Test database-heavy operations
  async testDatabasePerformance() {
    console.log(chalk.cyan('\n🗄️ Testing Database-Heavy Operations\n'));

    await this.authenticate();

    // Test complex aggregation queries
    await this.runLoadTest('/api/analytics/dashboard', {
      duration: 15,
      connections: 5
    });

    // Test search functionality
    await this.runLoadTest('/api/search?q=health&type=all', {
      duration: 15,
      connections: 8
    });

    // Test pagination
    await this.runLoadTest('/api/health-protocols?page=1&limit=20', {
      duration: 15,
      connections: 10
    });
  }

  // Stress test with increasing load
  async runStressTest(endpoint: string, maxConnections: number = 100) {
    console.log(chalk.cyan(`\n💪 Stress Testing ${endpoint}\n`));

    const connectionLevels = [10, 25, 50, 75, 100];
    const stressResults: TestResult[] = [];

    for (const connections of connectionLevels) {
      if (connections > maxConnections) break;

      console.log(chalk.yellow(`\n📈 Testing with ${connections} connections...`));
      
      const result = await this.runLoadTest(endpoint, {
        connections,
        duration: 10
      });

      stressResults.push(result);

      // Check if we're hitting limits
      if (result.errors > result.requests * 0.01) { // More than 1% errors
        console.log(chalk.red(`⚠️ Error threshold exceeded at ${connections} connections`));
        break;
      }

      if (result.latency.p99 > 5000) { // P99 latency over 5 seconds
        console.log(chalk.red(`⚠️ Latency threshold exceeded at ${connections} connections`));
        break;
      }
    }

    return stressResults;
  }

  // Spike test
  async runSpikeTest(endpoint: string) {
    console.log(chalk.cyan(`\n⚡ Spike Testing ${endpoint}\n`));

    // Normal load
    console.log(chalk.blue('Phase 1: Normal load (10 connections)'));
    await this.runLoadTest(endpoint, {
      connections: 10,
      duration: 10
    });

    // Sudden spike
    console.log(chalk.yellow('Phase 2: Spike (50 connections)'));
    await this.runLoadTest(endpoint, {
      connections: 50,
      duration: 10
    });

    // Return to normal
    console.log(chalk.blue('Phase 3: Return to normal (10 connections)'));
    await this.runLoadTest(endpoint, {
      connections: 10,
      duration: 10
    });
  }

  // Endurance test
  async runEnduranceTest(endpoint: string, durationMinutes: number = 5) {
    console.log(chalk.cyan(`\n⏱️ Endurance Testing ${endpoint} for ${durationMinutes} minutes\n`));

    await this.runLoadTest(endpoint, {
      connections: 10,
      duration: durationMinutes * 60,
      pipelining: 2
    });
  }

  // Generate performance report
  generateReport() {
    console.log(chalk.cyan('\n📋 Performance Test Report\n'));

    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        totalTests: this.results.length,
        totalRequests: this.results.reduce((sum, r) => sum + r.requests, 0),
        totalErrors: this.results.reduce((sum, r) => sum + r.errors, 0),
        totalTimeouts: this.results.reduce((sum, r) => sum + r.timeouts, 0)
      },
      endpoints: this.results.map(r => ({
        endpoint: r.endpoint,
        requests: r.requests,
        rps: Math.round(r.requests / r.duration),
        latency: r.latency,
        errorRate: `${((r.errors / r.requests) * 100).toFixed(2)}%`,
        status: this.getEndpointStatus(r)
      }))
    };

    // Print summary
    console.log(chalk.white('Summary:'));
    console.log(chalk.gray(`  Total Tests: ${report.summary.totalTests}`));
    console.log(chalk.gray(`  Total Requests: ${report.summary.totalRequests}`));
    console.log(chalk.gray(`  Total Errors: ${report.summary.totalErrors}`));
    console.log(chalk.gray(`  Total Timeouts: ${report.summary.totalTimeouts}`));

    // Print endpoint results
    console.log(chalk.white('\nEndpoint Results:'));
    report.endpoints.forEach(e => {
      const statusColor = e.status === 'PASS' ? chalk.green : 
                         e.status === 'WARN' ? chalk.yellow : 
                         chalk.red;
      
      console.log(`\n  ${statusColor(e.status)} ${e.endpoint}`);
      console.log(chalk.gray(`    Requests/sec: ${e.rps}`));
      console.log(chalk.gray(`    Latency P50: ${e.latency.p50}ms`));
      console.log(chalk.gray(`    Latency P90: ${e.latency.p90}ms`));
      console.log(chalk.gray(`    Latency P99: ${e.latency.p99}ms`));
      console.log(chalk.gray(`    Error Rate: ${e.errorRate}`));
    });

    // Save report to file
    const fs = require('fs');
    const reportPath = `test/performance/reports/report-${Date.now()}.json`;
    fs.mkdirSync('test/performance/reports', { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`\n✓ Report saved to ${reportPath}`));

    return report;
  }

  // Determine endpoint status based on performance
  private getEndpointStatus(result: TestResult): 'PASS' | 'WARN' | 'FAIL' {
    const errorRate = result.errors / result.requests;
    
    if (errorRate > 0.05) return 'FAIL'; // More than 5% errors
    if (result.latency.p99 > 5000) return 'FAIL'; // P99 over 5 seconds
    if (errorRate > 0.01) return 'WARN'; // More than 1% errors
    if (result.latency.p99 > 2000) return 'WARN'; // P99 over 2 seconds
    
    return 'PASS';
  }
}

// CLI execution
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  
  const testType = process.argv[2] || 'critical';
  
  async function runTests() {
    try {
      switch (testType) {
        case 'critical':
          await runner.testCriticalEndpoints();
          break;
        case 'database':
          await runner.testDatabasePerformance();
          break;
        case 'stress':
          await runner.authenticate();
          await runner.runStressTest('/api/health-protocols');
          break;
        case 'spike':
          await runner.authenticate();
          await runner.runSpikeTest('/api/health-protocols');
          break;
        case 'endurance':
          await runner.authenticate();
          await runner.runEnduranceTest('/api/health-protocols', 2);
          break;
        case 'full':
          await runner.testCriticalEndpoints();
          await runner.testDatabasePerformance();
          await runner.runStressTest('/api/health-protocols');
          break;
        default:
          console.log(chalk.yellow('Usage: npm run test:performance [critical|database|stress|spike|endurance|full]'));
          process.exit(1);
      }

      runner.generateReport();
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('Test execution failed:'), error);
      process.exit(1);
    }
  }

  runTests();
}

export default PerformanceTestRunner;