#!/usr/bin/env node

/**
 * Production Deployment Validation Script
 * Validates that the production deployment is working correctly
 */

const http = require('http');
const https = require('https');

// Configuration
const CONFIG = {
  baseUrl: process.env.VALIDATION_URL || 'http://localhost:8080',
  timeout: 10000,
  concurrentRequests: 10,
  maxResponseTime: 1000
};

console.log('🚀 Starting production deployment validation...');
console.log(`📍 Target URL: ${CONFIG.baseUrl}`);

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: CONFIG.timeout
    };

    const startTime = Date.now();
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: responseTime
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${CONFIG.timeout}ms`));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Health check validation
async function validateHealthChecks() {
  console.log('\n🏥 Validating health check endpoints...');
  
  const endpoints = [
    { path: '/health', name: 'Basic Health Check' },
    { path: '/ready', name: 'Readiness Check' },
    { path: '/live', name: 'Liveness Check' },
    { path: '/metrics', name: 'Metrics Endpoint' }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${CONFIG.baseUrl}${endpoint.path}`);
      
      if (response.statusCode === 200) {
        console.log(`✅ ${endpoint.name}: OK (${response.responseTime}ms)`);
        results.push({ ...endpoint, success: true, responseTime: response.responseTime });
      } else {
        console.log(`❌ ${endpoint.name}: Failed (Status: ${response.statusCode})`);
        results.push({ ...endpoint, success: false, error: `HTTP ${response.statusCode}` });
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
      results.push({ ...endpoint, success: false, error: error.message });
    }
  }
  
  return results;
}

// Performance validation
async function validatePerformance() {
  console.log('\n⚡ Validating application performance...');
  
  const testUrl = `${CONFIG.baseUrl}/health`;
  const requests = [];
  
  // Create concurrent requests
  for (let i = 0; i < CONFIG.concurrentRequests; i++) {
    requests.push(makeRequest(testUrl));
  }
  
  try {
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    const responseTimes = responses.map(r => r.responseTime);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    const successCount = responses.filter(r => r.statusCode === 200).length;
    
    console.log(`📊 Performance Results:`);
    console.log(`   Total requests: ${CONFIG.concurrentRequests}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${CONFIG.concurrentRequests - successCount}`);
    console.log(`   Total time: ${totalTime}ms`);
    console.log(`   Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Min response time: ${minResponseTime}ms`);
    console.log(`   Max response time: ${maxResponseTime}ms`);
    
    // Validate against thresholds
    const performanceResults = {
      success: true,
      metrics: {
        totalRequests: CONFIG.concurrentRequests,
        successfulRequests: successCount,
        failedRequests: CONFIG.concurrentRequests - successCount,
        totalTime,
        avgResponseTime,
        maxResponseTime,
        minResponseTime
      },
      issues: []
    };
    
    if (successCount < CONFIG.concurrentRequests) {
      performanceResults.issues.push(`${CONFIG.concurrentRequests - successCount} requests failed`);
      performanceResults.success = false;
    }
    
    if (avgResponseTime > CONFIG.maxResponseTime) {
      performanceResults.issues.push(`Average response time (${avgResponseTime.toFixed(2)}ms) exceeds threshold (${CONFIG.maxResponseTime}ms)`);
      performanceResults.success = false;
    }
    
    if (performanceResults.success) {
      console.log('✅ Performance validation passed');
    } else {
      console.log('❌ Performance validation failed:');
      performanceResults.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return performanceResults;
    
  } catch (error) {
    console.log(`❌ Performance test failed: ${error.message}`);
    return { 
      success: false, 
      error: error.message,
      metrics: null,
      issues: [error.message]
    };
  }
}

// Security headers validation
async function validateSecurityHeaders() {
  console.log('\n🔒 Validating security headers...');
  
  try {
    const response = await makeRequest(`${CONFIG.baseUrl}/health`);
    
    const requiredHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'x-xss-protection': '0',
      'strict-transport-security': null, // Just check if present
      'content-security-policy': null
    };
    
    const results = [];
    
    for (const [headerName, expectedValue] of Object.entries(requiredHeaders)) {
      const actualValue = response.headers[headerName];
      
      if (actualValue) {
        if (expectedValue && actualValue !== expectedValue) {
          console.log(`⚠️  ${headerName}: ${actualValue} (expected: ${expectedValue})`);
          results.push({ header: headerName, status: 'warning', value: actualValue });
        } else {
          console.log(`✅ ${headerName}: ${actualValue}`);
          results.push({ header: headerName, status: 'ok', value: actualValue });
        }
      } else {
        console.log(`❌ ${headerName}: Missing`);
        results.push({ header: headerName, status: 'missing', value: null });
      }
    }
    
    return results;
    
  } catch (error) {
    console.log(`❌ Security headers validation failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main validation function
async function runValidation() {
  console.log('🎯 Production Deployment Validation');
  console.log('=====================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: CONFIG.baseUrl,
    healthChecks: null,
    performance: null,
    securityHeaders: null,
    overall: { success: false, issues: [] }
  };
  
  try {
    // Run all validations
    results.healthChecks = await validateHealthChecks();
    results.performance = await validatePerformance();
    results.securityHeaders = await validateSecurityHeaders();
    
    // Determine overall success
    const healthChecksPassed = results.healthChecks.every(check => check.success);
    const performancePassed = results.performance.success;
    const securityHeadersOk = Array.isArray(results.securityHeaders) && 
      results.securityHeaders.every(header => header.status !== 'missing');
    
    if (!healthChecksPassed) {
      results.overall.issues.push('Some health checks failed');
    }
    
    if (!performancePassed) {
      results.overall.issues.push('Performance validation failed');
    }
    
    if (!securityHeadersOk) {
      results.overall.issues.push('Security headers validation failed');
    }
    
    results.overall.success = healthChecksPassed && performancePassed && securityHeadersOk;
    
    // Print summary
    console.log('\n📋 Validation Summary');
    console.log('====================');
    
    if (results.overall.success) {
      console.log('🎉 All validations passed! Production deployment is ready.');
    } else {
      console.log('❌ Validation failed. Issues found:');
      results.overall.issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // Save results to file
    if (process.env.SAVE_RESULTS === 'true') {
      const fs = require('fs');
      const resultsFile = 'production-validation-results.json';
      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
      console.log(`💾 Results saved to ${resultsFile}`);
    }
    
    // Exit with appropriate code
    process.exit(results.overall.success ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Validation failed with error:', error);
    process.exit(1);
  }
}

// Run validation if script is called directly
if (require.main === module) {
  runValidation().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = {
  runValidation,
  validateHealthChecks,
  validatePerformance,
  validateSecurityHeaders
};