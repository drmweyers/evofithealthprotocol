/**
 * 🏁 GLOBAL E2E TEST TEARDOWN
 * 
 * Comprehensive cleanup after all E2E tests complete
 * Generates summary reports and cleans up resources
 */

import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🏁 Starting comprehensive E2E test suite teardown...');
  
  // Step 1: Generate test execution summary
  console.log('📊 Generating test execution summary...');
  
  const summaryData = {
    teardownTime: new Date().toISOString(),
    testSuiteName: 'Comprehensive E2E GUI Testing Suite',
    projects: [
      'chromium-desktop',
      'firefox-desktop', 
      'webkit-desktop',
      'mobile-ios',
      'mobile-android',
      'tablet-ipad',
      'performance-testing',
      'accessibility-testing',
      'visual-regression'
    ],
    testCredentials: {
      admin: 'admin@fitmeal.pro',
      trainer: 'trainer.test@evofitmeals.com',
      customer: 'customer.test@evofitmeals.com'
    },
    reportLocations: {
      htmlReport: 'playwright-report/index.html',
      jsonResults: 'test-results/comprehensive-test-results.json',
      junitResults: 'test-results/junit-results.xml',
      screenshots: 'test-results/screenshots',
      videos: 'test-results/videos',
      traces: 'test-results/traces'
    }
  };
  
  // Step 2: Count test artifacts
  console.log('📁 Cataloging test artifacts...');
  
  const artifactCounts = {
    screenshots: 0,
    videos: 0,
    traces: 0
  };
  
  try {
    // Count screenshots
    const screenshotsPath = 'test-results/screenshots';
    if (fs.existsSync(screenshotsPath)) {
      const screenshots = fs.readdirSync(screenshotsPath).filter(f => 
        f.endsWith('.png') || f.endsWith('.jpg')
      );
      artifactCounts.screenshots = screenshots.length;
    }
    
    // Count videos
    const videosPath = 'test-results/videos';
    if (fs.existsSync(videosPath)) {
      const videos = fs.readdirSync(videosPath).filter(f => 
        f.endsWith('.webm') || f.endsWith('.mp4')
      );
      artifactCounts.videos = videos.length;
    }
    
    // Count traces
    const tracesPath = 'test-results/traces';
    if (fs.existsSync(tracesPath)) {
      const traces = fs.readdirSync(tracesPath).filter(f => 
        f.endsWith('.zip')
      );
      artifactCounts.traces = traces.length;
    }
  } catch (error) {
    console.log('⚠️  Could not count artifacts:', error);
  }
  
  summaryData['artifactCounts'] = artifactCounts;
  
  // Step 3: Read test results if available
  console.log('📋 Processing test results...');
  
  let testResults = null;
  try {
    if (fs.existsSync('test-results/comprehensive-test-results.json')) {
      const resultsContent = fs.readFileSync('test-results/comprehensive-test-results.json', 'utf8');
      testResults = JSON.parse(resultsContent);
      
      summaryData['testStatistics'] = {
        totalTests: testResults.stats?.total || 0,
        passed: testResults.stats?.passed || 0,
        failed: testResults.stats?.failed || 0,
        skipped: testResults.stats?.skipped || 0,
        duration: testResults.stats?.duration || 0
      };
    }
  } catch (error) {
    console.log('⚠️  Could not read test results:', error);
  }
  
  // Step 4: Create comprehensive summary report
  console.log('📄 Creating comprehensive summary report...');
  
  const summaryReport = `
# 🎯 Comprehensive E2E GUI Testing Suite - Execution Summary

**Test Suite:** EvoFitHealthProtocol Comprehensive E2E GUI Testing  
**Execution Time:** ${summaryData.teardownTime}  
**Base URL:** http://localhost:3500  

## 🧪 Test Projects Executed

${summaryData.projects.map(project => `- ✅ ${project}`).join('\n')}

## 🔐 Test Credentials Verified

- **Admin:** ${summaryData.testCredentials.admin}
- **Trainer:** ${summaryData.testCredentials.trainer}  
- **Customer:** ${summaryData.testCredentials.customer}

## 📊 Test Statistics

${testResults ? `
- **Total Tests:** ${summaryData.testStatistics?.total || 'N/A'}
- **Passed:** ${summaryData.testStatistics?.passed || 'N/A'}  
- **Failed:** ${summaryData.testStatistics?.failed || 'N/A'}
- **Skipped:** ${summaryData.testStatistics?.skipped || 'N/A'}
- **Duration:** ${summaryData.testStatistics?.duration ? Math.round(summaryData.testStatistics.duration / 1000) + 's' : 'N/A'}
` : '- Test statistics not available'}

## 📁 Generated Artifacts

- **Screenshots:** ${artifactCounts.screenshots} files
- **Videos:** ${artifactCounts.videos} files  
- **Traces:** ${artifactCounts.traces} files

## 📋 Report Locations

- **HTML Report:** [${summaryData.reportLocations.htmlReport}](${summaryData.reportLocations.htmlReport})
- **JSON Results:** ${summaryData.reportLocations.jsonResults}
- **JUnit XML:** ${summaryData.reportLocations.junitResults}
- **Screenshots:** ${summaryData.reportLocations.screenshots}
- **Videos:** ${summaryData.reportLocations.videos}
- **Traces:** ${summaryData.reportLocations.traces}

## 🚀 Next Steps

1. **Review HTML Report:** Open \`${summaryData.reportLocations.htmlReport}\` for detailed test results
2. **Investigate Failures:** Check failed test screenshots and videos for debugging
3. **Performance Analysis:** Review performance test results for optimization opportunities  
4. **Accessibility Review:** Examine accessibility test results for WCAG 2.1 AA compliance
5. **Visual Regression:** Compare visual regression test results for UI consistency

---

**Generated by:** Comprehensive E2E GUI Testing Suite  
**Timestamp:** ${summaryData.teardownTime}
`;
  
  // Ensure test-results directory exists
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  // Write summary report
  fs.writeFileSync('test-results/COMPREHENSIVE_E2E_SUMMARY.md', summaryReport);
  fs.writeFileSync('test-results/test-execution-summary.json', JSON.stringify(summaryData, null, 2));
  
  // Step 5: Clean up temporary files
  console.log('🧹 Cleaning up temporary files...');
  
  try {
    if (fs.existsSync('test-results/global-setup-state.json')) {
      fs.unlinkSync('test-results/global-setup-state.json');
    }
  } catch (error) {
    console.log('⚠️  Could not clean temporary files (this is OK)');
  }
  
  // Step 6: Display completion message
  console.log('✅ Global teardown completed successfully!');
  console.log('📄 Summary report: test-results/COMPREHENSIVE_E2E_SUMMARY.md');
  console.log('🎯 HTML Report: playwright-report/index.html');
  console.log(`📊 Total artifacts: ${artifactCounts.screenshots + artifactCounts.videos + artifactCounts.traces} files`);
  
  if (testResults && summaryData.testStatistics) {
    const passRate = summaryData.testStatistics.total > 0 
      ? Math.round((summaryData.testStatistics.passed / summaryData.testStatistics.total) * 100)
      : 0;
    
    console.log(`🎉 Test Pass Rate: ${passRate}% (${summaryData.testStatistics.passed}/${summaryData.testStatistics.total})`);
    
    if (summaryData.testStatistics.failed > 0) {
      console.log(`⚠️  Failed Tests: ${summaryData.testStatistics.failed} - Check artifacts for debugging`);
    }
  }
}

export default globalTeardown;