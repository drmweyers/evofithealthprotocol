# 🔧 PROTOCOL WIZARD DIALOG FIX - KNOWLEDGE BASE

## Quick Solution
If the Protocol Wizard won't open when clicking "Open Protocol Wizard" button, the component needs to be wrapped in a Dialog.

### The Fix (Copy-Paste Ready)
```tsx
// In TrainerHealthProtocols.tsx or similar component

import {
  Dialog,
  DialogContent,
} from "./ui/dialog";

// Replace this:
{showEnhancedWizard && (
  <ProtocolWizardEnhanced
    onComplete={handleWizardComplete}
    onCancel={() => setShowEnhancedWizard(false)}
  />
)}

// With this:
<Dialog open={showEnhancedWizard} onOpenChange={setShowEnhancedWizard}>
  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
    <ProtocolWizardEnhanced
      onComplete={handleWizardComplete}
      onCancel={() => setShowEnhancedWizard(false)}
    />
  </DialogContent>
</Dialog>
```

## Problem Symptoms
1. ❌ "Open Protocol Wizard" button doesn't open anything
2. ❌ Wizard shows blank page after selecting ailments
3. ❌ Dialog count remains 0 after clicking button
4. ❌ No visible wizard despite state showing `showEnhancedWizard = true`

## Root Cause
The `ProtocolWizardEnhanced` component is designed to be content INSIDE a dialog, not a dialog itself. It doesn't manage its own dialog state or wrapper.

## Diagnostic Test
```typescript
// Quick test to verify wizard is opening
test('Wizard opens in dialog', async ({ page }) => {
  // Login and navigate to protocols
  await page.goto('http://localhost:3501/protocols');
  
  // Count dialogs before
  const dialogsBefore = await page.locator('[role="dialog"]').count();
  console.log(`Dialogs before: ${dialogsBefore}`); // Should be 0
  
  // Click wizard button
  await page.locator('button:has-text("Open Protocol Wizard")').click();
  await page.waitForTimeout(1000);
  
  // Count dialogs after
  const dialogsAfter = await page.locator('[role="dialog"]').count();
  console.log(`Dialogs after: ${dialogsAfter}`); // Should be 1
  
  if (dialogsAfter > dialogsBefore) {
    console.log('✅ Wizard opened successfully!');
  } else {
    console.log('❌ Wizard did not open - needs Dialog wrapper!');
  }
});
```

## Complete Working Example
```tsx
// TrainerHealthProtocols.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent } from "./ui/dialog";
import ProtocolWizardEnhanced from './protocol-wizard/ProtocolWizardEnhanced';

const TrainerHealthProtocols: React.FC = () => {
  const [showEnhancedWizard, setShowEnhancedWizard] = useState(false);
  
  const handleWizardComplete = (data: any) => {
    console.log('Wizard completed:', data);
    setShowEnhancedWizard(false);
    // Handle the completed data
  };
  
  return (
    <div>
      {/* Button to open wizard */}
      <button onClick={() => setShowEnhancedWizard(true)}>
        Open Protocol Wizard
      </button>
      
      {/* Protocol Wizard Dialog - MUST BE WRAPPED! */}
      <Dialog open={showEnhancedWizard} onOpenChange={setShowEnhancedWizard}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <ProtocolWizardEnhanced
            onComplete={handleWizardComplete}
            onCancel={() => setShowEnhancedWizard(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

## Why This Happens
1. **Component Architecture**: `ProtocolWizardEnhanced` is pure content, not a modal
2. **Radix UI Pattern**: Dialog components need proper wrapper structure
3. **State Management**: Dialog open state managed by parent, not wizard

## Prevention Checklist
- [ ] All wizard/modal components wrapped in Dialog
- [ ] Dialog has `open` and `onOpenChange` props
- [ ] DialogContent wraps the actual component
- [ ] Test with Playwright that dialog count increases
- [ ] Check browser console for Dialog warnings

## Related Files
- `client/src/components/TrainerHealthProtocols.tsx` - Main file needing fix
- `client/src/components/protocol-wizard/ProtocolWizardEnhanced.tsx` - The wizard component
- `client/src/components/ui/dialog.tsx` - Dialog components from shadcn/ui

## Test Commands
```bash
# Run diagnostic test
npx playwright test test/e2e/wizard-diagnostic.spec.ts --headed

# Run all wizard tests
npx playwright test test/e2e/wizard*.spec.ts

# Quick manual test
npm run dev
# Navigate to http://localhost:3501/protocols
# Click "Open Protocol Wizard" button
# Should see dialog with "Step 1 of 8"
```

## Common Mistakes to Avoid
1. ❌ Don't render wizard conditionally without Dialog wrapper
2. ❌ Don't forget to import Dialog components
3. ❌ Don't use visibility toggles instead of Dialog open prop
4. ❌ Don't assume component manages its own dialog state

## Success Verification
After applying the fix, you should see:
- ✅ Dialog opens when button clicked
- ✅ Step indicator shows (e.g., "Step 1 of 8")
- ✅ Can navigate through all wizard steps
- ✅ No blank pages at any step
- ✅ Dialog closes properly on cancel/complete

## Historical Context
- **Date Fixed:** 2025-09-07
- **Time to Fix:** 1.5 hours (including diagnosis)
- **Verification:** 4 separate tests all passed
- **Story ID:** STORY-016
- **Critical Level:** HIGH - Blocked app launch

---
**Keywords:** wizard not opening, blank wizard, dialog wrapper, protocol wizard, radix ui dialog, shadcn dialog, modal not showing