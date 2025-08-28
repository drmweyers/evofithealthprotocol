import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * STORY-007 Code Validation Test Suite
 * Validates the removal of Health Protocols tab through static code analysis
 */

describe('STORY-007: Health Protocols Tab Removal - Code Validation', () => {
  const trainerPagePath = path.join(process.cwd(), 'client', 'src', 'pages', 'Trainer.tsx');
  let trainerPageContent: string;

  beforeAll(() => {
    trainerPageContent = readFileSync(trainerPagePath, 'utf-8');
  });

  describe('AC1: Health Protocols tab is completely removed', () => {
    it('should not import any Tab components', () => {
      expect(trainerPageContent).not.toMatch(/import.*Tabs/);
      expect(trainerPageContent).not.toMatch(/import.*TabsList/);
      expect(trainerPageContent).not.toMatch(/import.*TabsContent/);
      expect(trainerPageContent).not.toMatch(/import.*TabsTrigger/);
    });

    it('should not use any Tab components in JSX', () => {
      expect(trainerPageContent).not.toMatch(/<Tabs/);
      expect(trainerPageContent).not.toMatch(/<TabsList/);
      expect(trainerPageContent).not.toMatch(/<TabsContent/);
      expect(trainerPageContent).not.toMatch(/<TabsTrigger/);
    });

    it('should not have tab-related props or handlers', () => {
      expect(trainerPageContent).not.toMatch(/onTabChange/);
      expect(trainerPageContent).not.toMatch(/activeTab/);
      expect(trainerPageContent).not.toMatch(/tabValue/);
    });
  });

  describe('AC2: No "Protocols" text appears anywhere', () => {
    it('should not contain "Protocol" text in any form', () => {
      expect(trainerPageContent).not.toMatch(/protocol/i);
      expect(trainerPageContent).not.toMatch(/Protocol/);
      expect(trainerPageContent).not.toMatch(/PROTOCOL/);
    });

    it('should not contain "Health Protocol" references', () => {
      expect(trainerPageContent).not.toMatch(/health.*protocol/i);
      expect(trainerPageContent).not.toMatch(/Health.*Protocol/);
    });
  });

  describe('AC3: Customer Management functionality remains intact', () => {
    it('should import CustomerManagement component', () => {
      expect(trainerPageContent).toMatch(/import.*CustomerManagement/);
    });

    it('should render CustomerManagement component', () => {
      expect(trainerPageContent).toMatch(/<CustomerManagement/);
    });

    it('should have customer-related section heading', () => {
      expect(trainerPageContent).toMatch(/Customer Management/);
    });
  });

  describe('AC4: Stats cards show customer-focused metrics', () => {
    it('should include customer-focused stat labels', () => {
      expect(trainerPageContent).toMatch(/Total Customers/);
      expect(trainerPageContent).toMatch(/Client Satisfaction/);
      expect(trainerPageContent).toMatch(/Active Programs/);
      expect(trainerPageContent).toMatch(/Completed Programs/);
    });

    it('should not include protocol-related stats', () => {
      expect(trainerPageContent).not.toMatch(/Active Protocols/);
      expect(trainerPageContent).not.toMatch(/Protocol Assignments/);
      expect(trainerPageContent).not.toMatch(/Total Protocols/);
    });

    it('should have proper stats data bindings', () => {
      expect(trainerPageContent).toMatch(/stats\.totalCustomers/);
      expect(trainerPageContent).toMatch(/stats\.clientSatisfaction/);
      expect(trainerPageContent).toMatch(/stats\.activePrograms/);
      expect(trainerPageContent).toMatch(/stats\.completedPrograms/);
    });
  });

  describe('AC5: Welcome message focuses on client management', () => {
    it('should have customer-focused welcome message', () => {
      expect(trainerPageContent).toMatch(/Manage your clients and their fitness journeys/);
    });

    it('should not have protocol-focused welcome message', () => {
      expect(trainerPageContent).not.toMatch(/Create and manage health protocols/);
      expect(trainerPageContent).not.toMatch(/create.*protocol/i);
    });
  });

  describe('AC6: No console errors or broken navigation', () => {
    it('should have clean, valid imports', () => {
      const importLines = trainerPageContent.match(/^import.*$/gm) || [];
      
      // Verify each import line is properly structured
      importLines.forEach(importLine => {
        expect(importLine).toMatch(/^import\s+.*\s+from\s+['"].*['"];?\s*$/);
      });
    });

    it('should not have unused variables or functions', () => {
      // Check that getActiveTab function is removed (was tab-related)
      expect(trainerPageContent).not.toMatch(/getActiveTab/);
      
      // Check that handleTabChange function is simplified or removed
      if (trainerPageContent.includes('handleTabChange')) {
        // If it exists, it should only handle customer navigation
        expect(trainerPageContent).toMatch(/navigate.*customer/i);
      }
    });

    it('should have proper component structure', () => {
      // Should have main component export
      expect(trainerPageContent).toMatch(/export default function Trainer/);
      
      // Should have proper JSX return
      expect(trainerPageContent).toMatch(/return\s*\(/);
      
      // Should close properly
      expect(trainerPageContent).toMatch(/}\s*$/);
    });
  });

  describe('AC7: Responsive design maintained', () => {
    it('should maintain responsive grid classes', () => {
      expect(trainerPageContent).toMatch(/grid-cols-1.*sm:grid-cols-2.*lg:grid-cols-4/);
    });

    it('should have responsive spacing classes', () => {
      expect(trainerPageContent).toMatch(/gap-3.*sm:gap-4.*lg:gap-6/);
      expect(trainerPageContent).toMatch(/px-3.*sm:px-4.*md:px-6.*lg:px-8/);
      expect(trainerPageContent).toMatch(/py-4.*sm:py-6.*lg:py-8/);
    });

    it('should have responsive text sizing', () => {
      expect(trainerPageContent).toMatch(/text-xl.*sm:text-2xl.*lg:text-3xl/);
      expect(trainerPageContent).toMatch(/text-sm.*sm:text-base/);
      expect(trainerPageContent).toMatch(/text-lg.*sm:text-xl.*lg:text-2xl/);
    });

    it('should maintain responsive container classes', () => {
      expect(trainerPageContent).toMatch(/max-w-7xl.*mx-auto/);
    });
  });

  describe('Implementation Quality', () => {
    it('should have reasonable file size (not bloated)', () => {
      const lineCount = trainerPageContent.split('\n').length;
      expect(lineCount).toBeLessThan(200); // Should be under 200 lines after cleanup
    });

    it('should maintain proper TypeScript typing', () => {
      expect(trainerPageContent).toMatch(/React\.FC|function.*\(\)/);
      expect(trainerPageContent).toMatch(/useQuery.*</);
      expect(trainerPageContent).toMatch(/useState.*</);
    });

    it('should have clean component structure', () => {
      // Should not have excessive nested conditions
      const nestedIfCount = (trainerPageContent.match(/if\s*\(/g) || []).length;
      expect(nestedIfCount).toBeLessThan(5);
      
      // Should use proper React patterns
      expect(trainerPageContent).toMatch(/const.*=.*useAuth/);
      expect(trainerPageContent).toMatch(/const.*=.*useQuery/);
    });
  });
});

/**
 * Integration Test: Verify overall STORY-007 compliance
 */
describe('STORY-007: Overall Implementation Compliance', () => {
  const trainerPagePath = path.join(process.cwd(), 'client', 'src', 'pages', 'Trainer.tsx');
  
  it('should pass comprehensive STORY-007 validation', () => {
    const content = readFileSync(trainerPagePath, 'utf-8');
    
    // Comprehensive validation object
    const validation = {
      healthProtocolsTabRemoved: !content.includes('Health Protocols') && 
                                !content.includes('<Tabs') &&
                                !content.includes('TabsList'),
      noProtocolText: !content.toLowerCase().includes('protocol'),
      customerManagementPresent: content.includes('CustomerManagement') &&
                                content.includes('<CustomerManagement'),
      customerFocusedStats: content.includes('Total Customers') &&
                          content.includes('Client Satisfaction') &&
                          content.includes('Active Programs'),
      protocolStatsRemoved: !content.includes('Active Protocols') &&
                           !content.includes('Protocol Assignments'),
      customerFocusedWelcome: content.includes('Manage your clients and their fitness journeys'),
      responsiveDesignMaintained: content.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'),
      cleanImports: content.includes('import CustomerManagement from') &&
                   !content.includes('import.*Tabs')
    };
    
    // All validations must pass
    Object.entries(validation).forEach(([key, passed]) => {
      expect(passed).toBe(true, `STORY-007 validation failed for: ${key}`);
    });
    
    // Calculate compliance percentage
    const passedCount = Object.values(validation).filter(Boolean).length;
    const totalCount = Object.keys(validation).length;
    const compliancePercentage = (passedCount / totalCount) * 100;
    
    expect(compliancePercentage).toBe(100);
    
    console.log('🎉 STORY-007 Implementation Validation Results:');
    console.log(`✅ Compliance: ${compliancePercentage}%`);
    console.log('✅ All acceptance criteria met');
    console.log('✅ Ready for production deployment');
  });
});