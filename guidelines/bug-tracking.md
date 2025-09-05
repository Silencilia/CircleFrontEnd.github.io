# Bug Tracking & Prevention Guide

## Purpose
This file tracks bugs, their fixes, and key patterns to watch out for when making code edits. Always refer to this file before making changes to avoid recurring issues.

## Critical Patterns to Watch

### 1. ContentEditable Component Issues
**Problem**: ContentEditable components can preserve HTML formatting like `<br>` tags when clearing text
**Solution**: Always clean HTML tags before processing: `value.replace(/<[^>]*>/g, '').trim()`
**Files affected**: ContactCardDetail.tsx, any component using react-contenteditable
**Watch out for**: 
- Empty values showing as `<br>` or other HTML tags
- Need to clean input before saving
- Always check for empty strings with `.trim() !== ''`

### 2. State Update Race Conditions
**Problem**: Async state updates can cause components to unmount or show stale data
**Solution**: 
- Use proper error handling in async functions
- Don't exit editing mode on error
- Always check if component is still mounted before updating state
**Files affected**: ContactCardDetail.tsx, any component with async state updates
**Watch out for**:
- Components disappearing after state updates
- Stale data being displayed
- Missing error handling in async operations

### 3. Contact Object Validation
**Problem**: Contact objects can become invalid after updates, causing component unmounts
**Solution**: 
- Always validate contact objects before using them
- Use fallback values: `state.contacts.find(c => c.id === contact.id) || contact`
- Check for required fields before rendering
**Files affected**: ContactCardDetail.tsx, ContactCard.tsx, ContactBook.tsx
**Watch out for**:
- `currentContact` becoming undefined
- Missing required fields (id, name, etc.)
- Component unmounting after contact updates

### 4. useEffect Dependencies
**Problem**: Missing or incorrect dependencies can cause infinite loops or stale closures
**Solution**: 
- Always include all variables used in useEffect in the dependency array
- Use useCallback for functions passed as dependencies
- Be careful with object/array dependencies
**Files affected**: Any component using useEffect
**Watch out for**:
- Infinite re-renders
- Stale data in callbacks
- Missing dependencies causing bugs

### 5. Event Handler Timing
**Problem**: setTimeout in blur handlers can cause race conditions with click events
**Solution**: 
- Use shorter timeouts (100ms or less)
- Check component state before executing delayed actions
- Consider using onFocus instead of onBlur for better control
**Files affected**: ContactCardDetail.tsx
**Watch out for**:
- Save operations happening after component unmount
- Click events interfering with blur events
- Race conditions in event handling

## Recent Bugs & Fixes

### Bug #1: Occupation Field Showing `<br>` After Clearing
**Date**: [Current Date]
**Problem**: When clearing occupation field, component showed `<br>` instead of default value
**Root Cause**: ContentEditable preserving HTML formatting
**Fix**: Clean HTML tags before processing: `editOccupation.replace(/<[^>]*>/g, '').trim()`
**Prevention**: Always clean HTML input from ContentEditable components

### Bug #2: Contact Card Quitting After Occupation Save
**Date**: [Current Date]
**Problem**: ContactCardDetail component unmounted after saving empty occupation
**Root Cause**: State update causing contact object to become invalid
**Fix**: Use `null` instead of `undefined`, add proper error handling
**Prevention**: Always validate contact objects and handle async errors gracefully

### UI Guideline: Center Developer Preview Components
**Date**: [Current Date]
**Context**: Components showcased on `app/developer/page.tsx` should be centered for consistent previews.
**Decision**: Wrap developer preview sections with centered containers using `flex`, `items-center`, `justify-center`, and ensure inner wrappers use `mx-auto` and `items-center` as appropriate.
**Implementation**: The DatePicker preview and all future preview sections are centered via container classes in `app/developer/page.tsx`.
**Why**: Ensures consistent visual evaluation of components regardless of viewport width.

## Code Review Checklist

Before making any edit, check:

- [ ] Are there ContentEditable components? → Clean HTML tags
- [ ] Are there async state updates? → Add error handling
- [ ] Are there useEffect hooks? → Check dependencies
- [ ] Are there event handlers with timeouts? → Verify timing
- [ ] Are there object validations? → Add fallback checks
- [ ] Are there race conditions possible? → Add state checks

## Testing Scenarios

### ContentEditable Testing
- [ ] Test clearing text completely
- [ ] Test with HTML content
- [ ] Test with special characters
- [ ] Test with whitespace-only content

### State Update Testing
- [ ] Test async operations
- [ ] Test error scenarios
- [ ] Test component unmount during operation
- [ ] Test rapid successive updates

### Contact Object Testing
- [ ] Test with missing fields
- [ ] Test with invalid IDs
- [ ] Test after state updates
- [ ] Test with network errors

## File-Specific Notes

### ContactCardDetail.tsx
- **Critical**: Always clean HTML from ContentEditable inputs
- **Critical**: Validate contact objects before use
- **Critical**: Handle async errors without unmounting
- **Watch**: Occupation and name editing logic

### ContactContext.tsx
- **Critical**: Ensure state updates don't corrupt objects
- **Critical**: Handle async operation failures
- **Watch**: updateContactAsync, addOccupationAsync functions

### dataService.ts
- **Critical**: Validate data before saving
- **Critical**: Handle localStorage errors gracefully
- **Watch**: updateContact, saveData functions

## Prevention Strategies

1. **Always clean HTML input** from ContentEditable components
2. **Add error boundaries** around critical components
3. **Validate objects** before using them
4. **Use TypeScript strictly** - no `any` types
5. **Test edge cases** - empty strings, null values, undefined
6. **Add logging** for debugging complex operations
7. **Use proper error handling** in all async operations

## Last Updated
[Current Date] - Initial creation
