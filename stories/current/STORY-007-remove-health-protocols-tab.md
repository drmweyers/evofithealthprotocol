# STORY-007: Remove Health Protocols Tab from Trainer Dashboard

**Created:** 2025-08-27  
**Status:** In Progress  
**Developer:** CTO Agent Team  
**Estimated Effort:** 2 days  
**Priority:** High  

---

## 📋 Story Overview

### Problem Statement
The Health Protocols tab needs to be removed from the Trainer dashboard as per business requirements. The trainer profile currently shows "Health Protocols" as a tab alongside "Customer Management", and this needs to be simplified to show only customer management functionality.

### Business Value
- Streamline trainer interface for better UX
- Focus trainers on core customer management features
- Reduce complexity and maintenance overhead
- Align with updated product strategy

### Success Criteria
- [ ] Health Protocols tab completely removed from Trainer dashboard
- [ ] No broken routes or imports related to health protocols
- [ ] Customer Management remains fully functional
- [ ] All related components and routes cleaned up
- [ ] No console errors or warnings
- [ ] Tests updated to reflect the change

---

## 🏗️ Technical Context

### Current Implementation
- **Location:** `client/src/pages/Trainer.tsx`
- **Current tabs:** Health Protocols (default) and Customer Management
- **Routing:** `/trainer/health-protocols` and `/trainer/customers`
- **Component:** `TrainerHealthProtocols` imported and used

### Files to Modify
1. `client/src/pages/Trainer.tsx` - Remove tab and related logic
2. Router configuration - Remove health protocol routes
3. Component imports - Clean up unused imports
4. Test files - Update to reflect removed functionality

### Dependencies
- React Router (wouter)
- Tabs component from shadcn/ui
- TrainerHealthProtocols component (to be removed from imports)

---

## 📝 Implementation Details

### Step 1: Remove Health Protocols Tab
- Remove the health-protocols TabsTrigger from the Tabs component
- Remove the health-protocols TabsContent section
- Update the grid-cols-2 to single column or adjust as needed
- Set customers as the default and only tab

### Step 2: Clean Up Routing Logic
- Remove health-protocols case from handleTabChange function
- Remove health-protocols from getActiveTab function
- Update default tab to 'customers'
- Remove any references to `/trainer/health-protocols` route

### Step 3: Remove Component Import
- Remove `import TrainerHealthProtocols from "../components/TrainerHealthProtocols"`
- Ensure no other files are importing this if it's being deprecated

### Step 4: Update Welcome Message
- Update the welcome message to reflect customer management focus
- Change from "Create and manage health protocols" to appropriate message

### Step 5: Update Stats Cards (if needed)
- Review if "Active Protocols" and "Protocol Assignments" stats are still relevant
- Consider replacing with customer-focused metrics

---

## 🧪 Testing Strategy

### Manual Testing
1. Navigate to `/trainer` route
2. Verify only Customer Management functionality is visible
3. Check that no health protocols tab appears
4. Ensure no console errors
5. Test all customer management features work correctly

### Automated Testing with Playwright
```javascript
test('trainer dashboard should not have health protocols tab', async ({ page }) => {
  // Login as trainer
  await page.goto('/login');
  await page.fill('input[type="email"]', 'trainer@test.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to trainer dashboard
  await page.waitForURL('/trainer/**');
  
  // Verify health protocols tab doesn't exist
  await expect(page.locator('text="Health Protocols"')).not.toBeVisible();
  await expect(page.locator('text="Protocols"')).not.toBeVisible();
  
  // Verify customer management is present
  await expect(page.locator('text="Customer Management"')).toBeVisible();
});
```

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Health Protocols tab is completely removed from UI
- [ ] No visual artifacts or layout issues after removal
- [ ] Customer Management tab functions normally
- [ ] No broken routes when navigating trainer pages
- [ ] Stats display correctly (or are updated appropriately)

### Non-Functional Requirements
- [ ] No console errors or warnings
- [ ] Page loads within acceptable time
- [ ] Responsive design maintained on all screen sizes
- [ ] Accessibility standards maintained

### Edge Cases
- [ ] Direct navigation to old `/trainer/health-protocols` route handled gracefully
- [ ] Bookmarked health protocols URLs redirect appropriately
- [ ] Browser back/forward navigation works correctly

---

## ✅ Definition of Done

1. **Code Complete**
   - [ ] All Health Protocols UI elements removed
   - [ ] Routing logic updated
   - [ ] Unused imports cleaned up
   - [ ] Code committed to repository

2. **Testing Complete**
   - [ ] Manual testing passed
   - [ ] Playwright automated tests created and passing
   - [ ] No regression in existing functionality
   - [ ] Edge cases validated

3. **Documentation**
   - [ ] BMAD story tracking updated
   - [ ] Changes documented in commit messages
   - [ ] Any API changes documented (if applicable)

4. **Review**
   - [ ] Code reviewed and approved
   - [ ] UX validated by stakeholder
   - [ ] No security vulnerabilities introduced

---

## 🚨 Risk Mitigation

### Identified Risks
1. **Breaking existing customer workflows** - Mitigated by thorough testing
2. **Dead code left behind** - Mitigated by comprehensive cleanup
3. **Broken deep links** - Mitigated by proper redirect handling
4. **Test failures** - Mitigated by updating test suite

### Rollback Plan
- Git revert to previous commit if critical issues found
- Feature flag to toggle between old and new UI (if implemented)

---

## 📊 Progress Tracking

### Current Status: In Progress
- [x] Story created and documented
- [x] Initial file analysis completed
- [ ] Implementation started
- [ ] Testing in progress
- [ ] Ready for review
- [ ] Completed and validated

### Time Tracking
- Estimated: 2 days
- Actual: In progress
- Started: 2025-08-27

---

_This story is part of the HealthProtocol BMAD implementation workflow._