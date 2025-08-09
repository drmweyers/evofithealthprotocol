/**
 * Simple Health Protocol API Test
 * 
 * Tests the health protocol API endpoints to verify backend functionality
 */

const http = require('http');

class HealthProtocolAPITester {
  constructor() {
    this.baseUrl = 'http://localhost:4000';
    this.results = {
      apiEndpoints: {},
      jsErrorCheck: { success: false, errors: [] }
    };
  }

  async makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (body) {
        const bodyString = JSON.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(bodyString);
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsedData = data ? JSON.parse(data) : null;
            resolve({
              status: res.statusCode,
              data: parsedData,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async testServerHealth() {
    console.log('🏥 Testing server health...');
    try {
      const response = await this.makeRequest('/api/health');
      if (response.status === 200) {
        console.log('✅ Server is healthy');
        return true;
      } else {
        console.log('❌ Server health check failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Server health check error:', error.message);
      return false;
    }
  }

  async testHealthProtocolEndpoints() {
    console.log('🧬 Testing health protocol API endpoints...');
    
    const endpoints = [
      { path: '/api/trainer/health-protocols', method: 'GET', name: 'Get Health Protocols' },
      { path: '/api/specialized/longevity/generate', method: 'POST', name: 'Longevity Generation', 
        body: {
          planName: 'Test Longevity Plan',
          duration: 30,
          fastingProtocol: '16:8',
          experienceLevel: 'beginner',
          primaryGoals: ['anti_aging'],
          dailyCalorieTarget: 2000,
          clientName: 'Test User'
        }
      },
      { path: '/api/specialized/parasite-cleanse/generate', method: 'POST', name: 'Parasite Cleanse Generation',
        body: {
          planName: 'Test Parasite Cleanse',
          duration: '14',
          intensity: 'gentle',
          experienceLevel: 'first_time',
          healthcareProviderConsent: true,
          clientName: 'Test User'
        }
      },
      { path: '/api/specialized/ailments-based/generate', method: 'POST', name: 'Ailments-based Generation',
        body: {
          planName: 'Test Ailments Plan',
          duration: 30,
          selectedAilments: ['diabetes', 'hypertension'],
          dailyCalorieTarget: 2000,
          clientName: 'Test User'
        }
      }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`  Testing ${endpoint.name}...`);
        const response = await this.makeRequest(endpoint.path, endpoint.method, endpoint.body);
        
        this.results.apiEndpoints[endpoint.name] = {
          success: response.status < 400,
          status: response.status,
          hasData: !!response.data,
          error: response.status >= 400 ? response.data : null
        };
        
        if (response.status < 400) {
          console.log(`  ✅ ${endpoint.name} - Status: ${response.status}`);
        } else {
          console.log(`  ❌ ${endpoint.name} - Status: ${response.status}, Error: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint.name} - Error: ${error.message}`);
        this.results.apiEndpoints[endpoint.name] = {
          success: false,
          error: error.message
        };
      }
    }
  }

  async testStaticPageLoad() {
    console.log('🌐 Testing static page loads...');
    
    const pages = [
      { path: '/', name: 'Home Page' },
      { path: '/login', name: 'Login Page' },
      { path: '/admin', name: 'Admin Page' }
    ];

    for (const page of pages) {
      try {
        console.log(`  Testing ${page.name}...`);
        const response = await this.makeRequest(page.path);
        
        if (response.status === 200) {
          // Check for potential JavaScript errors in the HTML
          const html = response.data || '';
          const hasReactErrors = html.includes('React') && html.includes('error');
          const hasJSErrors = html.includes('undefined') && html.includes('variable');
          
          console.log(`  ✅ ${page.name} - Status: ${response.status}`);
          
          if (hasReactErrors || hasJSErrors) {
            console.log(`  ⚠️ ${page.name} may have JavaScript issues`);
            this.results.jsErrorCheck.errors.push(`${page.name} may have JS issues`);
          }
        } else {
          console.log(`  ❌ ${page.name} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${page.name} - Error: ${error.message}`);
      }
    }
  }

  generateSummaryReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        apiEndpointsWorking: Object.values(this.results.apiEndpoints).filter(r => r.success).length,
        apiEndpointsTotal: Object.keys(this.results.apiEndpoints).length,
        potentialJSErrors: this.results.jsErrorCheck.errors.length
      },
      apiResults: this.results.apiEndpoints,
      jsErrorsFound: this.results.jsErrorCheck.errors,
      recommendations: []
    };

    // Generate recommendations
    const failedEndpoints = Object.entries(this.results.apiEndpoints)
      .filter(([name, result]) => !result.success)
      .map(([name, result]) => name);

    if (failedEndpoints.length > 0) {
      report.recommendations.push(`Fix failed API endpoints: ${failedEndpoints.join(', ')}`);
    }

    if (this.results.jsErrorCheck.errors.length > 0) {
      report.recommendations.push('Investigate potential JavaScript errors in page rendering');
    }

    // Display summary
    console.log('\n📊 HEALTH PROTOCOL API TEST SUMMARY:');
    console.log('======================================');
    console.log(`API Endpoints Working: ${report.summary.apiEndpointsWorking}/${report.summary.apiEndpointsTotal}`);
    console.log(`Potential JS Issues: ${report.summary.potentialJSErrors}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    Object.entries(this.results.apiEndpoints).forEach(([name, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${name}: ${result.success ? 'WORKING' : 'FAILED'}`);
      if (!result.success && result.error) {
        console.log(`   Error: ${typeof result.error === 'object' ? JSON.stringify(result.error) : result.error}`);
      }
    });

    return report;
  }

  async runFullTest() {
    console.log('🧪 Starting Simple Health Protocol API Test...\n');
    
    // Test server health first
    const serverHealthy = await this.testServerHealth();
    if (!serverHealthy) {
      console.log('❌ Server is not healthy, aborting tests');
      return { error: 'Server not healthy' };
    }

    // Run all tests
    await this.testHealthProtocolEndpoints();
    await this.testStaticPageLoad();
    
    return this.generateSummaryReport();
  }
}

// Run the test
async function main() {
  const tester = new HealthProtocolAPITester();
  const report = await tester.runFullTest();
  
  if (report.error) {
    console.error('Test failed with error:', report.error);
    process.exit(1);
  } else {
    console.log('\n✅ API testing completed successfully');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = HealthProtocolAPITester;