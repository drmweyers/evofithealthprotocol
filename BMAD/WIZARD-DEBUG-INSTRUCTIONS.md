# Protocol Wizard Debug Instructions

## CRITICAL: How to Debug the Protocol Wizard Issue

### What We've Added

We've added extensive debug logging to help identify why the Protocol Wizard isn't working. Here's what you'll see:

### 1. Visual Debug Indicators

#### A. Red Debug Box (Top Right)
- **Location**: Fixed position, top-right corner of the wizard
- **Shows**: 
  - 🚨 WIZARD IS RENDERING 🚨
  - Current step number
  - User email
- **Purpose**: If you see this RED box with yellow border, the wizard component is rendering

#### B. Test Modal Button (Red Button)
- **Location**: Fixed position, right side of screen
- **Text**: "🚨 Test Modal"
- **Purpose**: Click this to test if ANY modal works at all
- **Expected**: Should show a green-bordered modal saying "TEST MODAL WORKS!"

### 2. Console Debug Logs

Open browser DevTools (F12) and look for these logs in the Console:

#### TrainerHealthProtocols.tsx Logs:
```
🚨🚨🚨 TRAINER HEALTH PROTOCOLS - MOUNTING
🚨 User: {id, role, email}
🚨 Initial showEnhancedWizard state: false
🚨 showEnhancedWizard state changed to: true/false
🚨🚨🚨 ENHANCED WIZARD CARD CLICKED!
🚨 Setting showEnhancedWizard to true...
🚨 Dialog render check - showEnhancedWizard: true/false
🚨 DialogContent rendering
```

#### ProtocolWizardEnhanced.tsx Logs:
```
🚨🚨🚨 PROTOCOL WIZARD ENHANCED - MOUNTING
🚨 Props received: {onComplete, onCancel}
🚨 Component mounting at: [timestamp]
🚨 Window location: [URL]
🚨 User context: {userId, userRole, userEmail}
🚨 Wizard configuration: {steps, isAdmin, startingStep}
```

### 3. How to Test

1. **Open Browser DevTools**
   - Press F12
   - Go to Console tab
   - Clear console (Ctrl+L or click clear button)

2. **Test Basic Modal First**
   - Click the red "🚨 Test Modal" button
   - You should see a green-bordered modal
   - If this doesn't work, NO modals will work

3. **Test Protocol Wizard**
   - Click "Enhanced Protocol Wizard" card
   - Watch console for logs
   - Look for the red debug box (top-right)

4. **What to Report Back**

Please provide:
- [ ] Screenshot of the page after clicking wizard
- [ ] All red error messages from console
- [ ] Which debug logs you see (list them)
- [ ] Does the test modal work? (Yes/No)
- [ ] Do you see the red debug box? (Yes/No)
- [ ] Browser and version (Chrome, Firefox, etc.)
- [ ] User account you're logged in as

### 4. Likely Issues Based on What You See

#### Scenario 1: No Console Logs at All
- **Problem**: Component not mounting
- **Check**: Is the page loading at all?
- **Check**: Are you on the right page? (/protocols)

#### Scenario 2: Logs Show But No Visual
- **Problem**: CSS/z-index issue or Dialog component broken
- **Check**: Look for the red debug box
- **Check**: Try the test modal button

#### Scenario 3: Test Modal Works, Wizard Doesn't
- **Problem**: Dialog component specific issue
- **Check**: Console errors about Dialog
- **Check**: Network tab for failed API calls

#### Scenario 4: Red Debug Box Shows
- **Success**: Wizard IS rendering!
- **Problem**: Might be positioned off-screen or behind something
- **Check**: Scroll around, check z-index

### 5. Quick Fixes to Try

1. **Hard Refresh**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

2. **Clear Browser Cache**
   - DevTools > Application > Clear Storage

3. **Check Docker**
   ```bash
   docker ps
   docker logs evofithealthprotocol-dev --tail 50
   ```

4. **Restart Development Server**
   ```bash
   npm run stop
   npm run dev
   ```

### 6. Information Needed

To solve this issue, we need:

1. **Exact Error Message** - Copy any red text from console
2. **Debug Log Output** - Which logs appear and in what order
3. **Visual Confirmation** - Screenshots of what you see
4. **Browser Info** - Browser name and version
5. **User Context** - Which account you're using

### 7. Nuclear Option

If nothing works, we can replace the entire wizard with a simple div to test:

1. Comment out the Dialog component
2. Add a simple div with red background
3. If that shows, it's a Dialog/shadcn issue
4. If that doesn't show, it's a state management issue

## Next Steps

1. User tests with the debug code
2. Reports back with console logs and screenshots
3. We identify the ACTUAL issue (not what tests say)
4. We fix the real problem
5. We remove debug code once fixed

## Important Notes

- Tests passing ≠ Feature working
- We need to see the ACTUAL error
- Debug logs will reveal the truth
- The red debug box is the ultimate proof the wizard renders