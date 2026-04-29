import React, { useState } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    alpha,
    useTheme,
    Button,
    Chip,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsNone as EmptyBellIcon,
    Circle as CircleIcon,
    CheckCircle as ApprovedIcon,
    Cancel as RejectedIcon,
    CreditCard as CardIcon,
    Warning as ExpiryIcon,
    Info as InfoIcon,
    DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

// ── Icon + colour per notification type ──────────────────────────────────────
function NotificationIcon({ type }: { type: string }) {
    const theme = useTheme();
    const map: Record<string, { icon: React.ReactNode; bg: string }> = {
        VISA_EXPIRY:    { icon: <ExpiryIcon   sx={{ fontSize: 19 }} />, bg: alpha(theme.palette.error.main,   0.12) },
        VISA_APPROVED:  { icon: <ApprovedIcon  sx={{ fontSize: 19 }} />, bg: alpha('#10B981', 0.12) },
        VISA_REJECTED:  { icon: <RejectedIcon  sx={{ fontSize: 19 }} />, bg: alpha(theme.palette.error.main,   0.12) },
        CARD_ISSUED:    { icon: <CardIcon      sx={{ fontSize: 19 }} />, bg: alpha(theme.palette.primary.main, 0.12) },
        SYSTEM:         { icon: <InfoIcon      sx={{ fontSize: 19 }} />, bg: alpha('#64748B', 0.12) },
    };

    const cfg = map[type] ?? map.SYSTEM;
    const colorMap: Record<string, string> = {
        VISA_EXPIRY:   theme.palette.error.main,
        VISA_APPROVED: '#10B981',
        VISA_REJECTED: theme.palette.error.main,
        CARD_ISSUED:   theme.palette.primary.main,
        SYSTEM:        '#64748B',
    };

    return (
        <Box sx={{
            mr: 1.5, mt: 0.25,
            width: 38, height: 38,
            borderRadius: '50%',
            bgcolor: cfg.bg,
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
            color: colorMap[type] ?? '#64748B',
        }}>
            {cfg.icon}
        </Box>
    );
}

export function NotificationBell() {
    const theme = useTheme();
    const { data: notifications = [], isLoading } = useNotifications();
    const { mutate: markRead }                    = useMarkNotificationRead();
    const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const display = notifications.slice(0, 8);   // show at most 8 in the popover

    const handleClick = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleNotificationClick = (id: string) => {
        markRead(id);
    };

    return (
        <Box>
            <Tooltip title="Notifications">
                <IconButton
                    onClick={handleClick}
                    sx={{
                        color: open ? 'primary.main' : '#64748B',
                        bgcolor: open ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        transition: 'all 0.2s',
                    }}
                >
                    <Badge badgeContent={unreadCount || null} color="error" overlap="circular">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        width: 380,
                        maxHeight: 520,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        filter: 'drop-shadow(0px 8px 32px rgba(0,0,0,0.14))',
                        mt: 1.5,
                        borderRadius: 3,
                        border: '1px solid #E2E8F0',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={900}>Notifications</Typography>
                        {unreadCount > 0 && (
                            <Chip label={unreadCount} size="small" color="error" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800 }} />
                        )}
                    </Box>
                    {unreadCount > 0 && (
                        <Tooltip title="Mark all as read">
                            <IconButton
                                size="small"
                                onClick={() => markAllRead()}
                                disabled={markingAll}
                                sx={{ color: 'primary.main' }}
                            >
                                {markingAll ? <CircularProgress size={16} /> : <DoneAllIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                <Divider />

                {/* ── List ───────────────────────────────────────────── */}
                <List sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
                    {isLoading ? (
                        <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <EmptyBellIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
                        </Box>
                    ) : (
                        display.map((n) => (
                            <React.Fragment key={n.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    onClick={() => handleNotificationClick(n.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        py: 1.5,
                                        px: 2.5,
                                        bgcolor: n.is_read ? 'transparent' : alpha(theme.palette.primary.main, 0.04),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.07) },
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <NotificationIcon type={n.notification_type || 'SYSTEM'} />
                                    <ListItemText
                                        disableTypography
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                                                <Typography variant="body2" fontWeight={n.is_read ? 600 : 800} color="#1E293B" sx={{ lineHeight: 1.3 }}>
                                                    {n.title}
                                                </Typography>
                                                {!n.is_read && <CircleIcon sx={{ color: 'primary.main', fontSize: 8, ml: 0.5, flexShrink: 0 }} />}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.45 }}>
                                                    {n.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.4, display: 'block' }}>
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>

                {/* ── Footer ─────────────────────────────────────────── */}
                {notifications.length > 8 && (
                    <Box sx={{ px: 2, py: 1.5, flexShrink: 0, borderTop: '1px solid #F1F5F9' }}>
                        <Button
                            fullWidth
                            size="small"
                            variant="text"
                            sx={{ color: 'text.secondary', fontWeight: 700, borderRadius: 2 }}
                        >
                            View all {notifications.length} notifications
                        </Button>
                    </Box>
                )}
            </Menu>
        </Box>
    );
}
