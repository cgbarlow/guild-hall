# SPEC-008: Theme System

**Status:** Draft
**Created:** 2026-01-24
**Related ADR:** N/A (non-architecturally significant)

## Overview

This specification defines the dark mode theme system for Guild Hall, enabling users to switch between light, dark, and system-preference-based themes.

## Theme Options

| Option | Description |
|--------|-------------|
| `light` | Always use light theme |
| `dark` | Always use dark theme |
| `system` | Follow OS preference via `prefers-color-scheme` |

## Persistence

- **Storage Key:** `guild-hall-theme`
- **Storage Type:** localStorage
- **Default Value:** `system`
- **Value Type:** `'light' | 'dark' | 'system'`

## CSS Approach

- Uses Tailwind CSS dark mode with `class` strategy
- Theme class (`dark`) applied to `document.documentElement` (`<html>` element)
- CSS variables defined in `globals.css` for `:root` (light) and `.dark` (dark)

## System Preference Detection

```typescript
// Detect system preference
const systemPreference = window.matchMedia('(prefers-color-scheme: dark)')

// Listen for changes
systemPreference.addEventListener('change', (e) => {
  if (theme === 'system') {
    applyTheme(e.matches ? 'dark' : 'light')
  }
})
```

## Implementation Components

### 1. Theme Hook (`use-theme.ts`)

```typescript
interface UseThemeReturn {
  theme: Theme           // Current setting: 'light' | 'dark' | 'system'
  resolvedTheme: 'light' | 'dark'  // Actual applied theme
  setTheme: (theme: Theme) => void
}
```

### 2. Theme Provider (`theme-provider.tsx`)

- React Context for theme state
- Handles hydration mismatch via `suppressHydrationWarning`
- Initializes from localStorage on mount
- Applies theme class to document

### 3. Theme Toggle (`theme-toggle.tsx`)

- Three-option selector: Light, Dark, System
- Visual indicators for current selection
- Accessible keyboard navigation

## Hydration Considerations

To prevent flash of incorrect theme:

1. Add `suppressHydrationWarning` to `<html>` tag
2. Initialize theme state as `undefined` during SSR
3. Read from localStorage only in useEffect (client-side)
4. Apply class to document.documentElement in useEffect

## CSS Variables

Already defined in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... light mode variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
```

## File Structure

```
src/
  lib/
    hooks/
      use-theme.ts
  providers/
    theme-provider.tsx
  components/
    settings/
      theme-toggle.tsx
  app/
    (dashboard)/
      settings/
        appearance/
          page.tsx
```
