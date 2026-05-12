import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { createTheme, ThemeProvider, type PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// ─── Context ──────────────────────────────────────────────────────────────────
interface ThemeContextValue {
    mode: PaletteMode;
    toggleMode: () => void;
}
const ThemeCtx = createContext<ThemeContextValue>({ mode: 'light', toggleMode: () => {} });
export const useThemeMode = () => useContext(ThemeCtx);

// ─── Build MUI theme ──────────────────────────────────────────────────────────
function buildTheme(mode: PaletteMode) {
    return createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    primary:    { main: '#2563EB' },
                    background: { default: '#F8FAFC', paper: '#FFFFFF' },
                }
                : {
                    primary:    { main: '#60A5FA' },
                    background: { default: '#0F172A', paper: '#1E293B' },
                    text:       { primary: '#F1F5F9', secondary: '#94A3B8' },
                }),
        },
        typography: { fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" },
        shape: { borderRadius: 12 },
        components: {
            MuiPaper:  { styleOverrides: { root: { backgroundImage: 'none', transition: 'background-color 0.3s' } } },
            MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } } },
        },
    });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ims-theme-mode';

export function AppThemeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<PaletteMode>(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as PaletteMode | null;
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Persist mode
    useEffect(() => { localStorage.setItem(STORAGE_KEY, mode); }, [mode]);

    const toggleMode = () => setMode(m => m === 'light' ? 'dark' : 'light');
    const theme = useMemo(() => buildTheme(mode), [mode]);

    return (
        <ThemeCtx.Provider value={{ mode, toggleMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeCtx.Provider>
    );
}
