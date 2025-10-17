"use client"
import { useCustomTheme } from '@/hooks/useCustomTheme';

export default function ThemeProvider({ children }) {
    useCustomTheme();
    return <>{children}</>;
}
