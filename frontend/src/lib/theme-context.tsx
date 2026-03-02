"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="retro"
            enableSystem={false}
            disableTransitionOnChange
            themes={["light", "dark", "retro"]}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
