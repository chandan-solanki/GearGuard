// This file defines a small wrapper around `next-themes`'s ThemeProvider.
//
// Notes:
// - This is a client component (see the "use client" directive below) because
//   theme handling depends on browser APIs (e.g., localStorage and matchMedia).
// - The wrapper simply forwards all props to `NextThemesProvider` so other
//   parts of the app can import this file instead of depending directly on
//   `next-themes`. This allows us to centralize configuration or add
//   instrumentation in one place in the future.

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * ThemeProvider
 *
 * A thin wrapper around `next-themes`'s `ThemeProvider`.
 *
 * Props: same as `NextThemesProvider` (see `next-themes` types).
 *
 * Example:
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  // Forward all props to next-themes provider and render children.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}