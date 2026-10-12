import { useState } from 'react';
import {
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Tooltip,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
];

interface LanguageSwitcherProps {
    /** If true, shows a compact icon-only button. Default is false (shows icon + text). */
    compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
    const { i18n, t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (code: string) => {
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
        handleClose();
    };

    return (
        <>
            <Tooltip title={t('lang.switchLanguage')}>
                <IconButton
                    onClick={handleOpen}
                    size="small"
                    aria-controls={open ? 'language-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    sx={{
                        borderRadius: 2,
                        px: compact ? 1 : 1.5,
                        py: 0.75,
                        border: '1px solid',
                        borderColor: 'divider',
                        gap: 0.75,
                        '&:hover': { bgcolor: 'action.hover' },
                    }}
                >
                    <LanguageIcon fontSize="small" />
                    {!compact && (
                        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {currentLang.code.toUpperCase()}
                        </Typography>
                    )}
                </IconButton>
            </Tooltip>

            <Menu
                id="language-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 4,
                    sx: { mt: 1, minWidth: 160, borderRadius: 2 },
                }}
            >
                {LANGUAGES.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        selected={i18n.language === lang.code}
                        sx={{
                            borderRadius: 1,
                            mx: 0.5,
                            my: 0.25,
                            '&.Mui-selected': {
                                bgcolor: 'primary.50',
                                fontWeight: 700,
                            },
                        }}
                    >
                        <Box component="span" sx={{ mr: 1.5, fontSize: '1.1rem' }}>
                            {lang.flag}
                        </Box>
                        <Typography variant="body2" fontWeight={i18n.language === lang.code ? 700 : 400}>
                            {lang.label}
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
