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
    Button
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
    Assignment as VisaIcon
} from '@mui/icons-material';
import { useNotifications, useMarkNotificationRead } from '../../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
    const theme = useTheme();
    const { data: notifications = [] } = useNotifications();
    const { mutate: markRead } = useMarkNotificationRead();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (id: string) => {
        markRead(id);
        // We don't close the menu automatically to allow reading multiple
    };

    const handleMarkAllRead = () => {
        notifications.forEach(n => {
            if (!n.is_read) markRead(n.id);
        });
    };

    return (
        <Box>
            <IconButton
                onClick={handleClick}
                sx={{
                    color: open ? 'primary.main' : '#64748B',
                    bgcolor: open ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    transition: 'all 0.2s'
                }}
            >
                <Badge badgeContent={unreadCount} color="error" overlap="circular">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        width: 360,
                        maxHeight: 480,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.12))',
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
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={800}>Notifications</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead} sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />

                <List sx={{ p: 0 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">No notifications yet</Typography>
                        </Box>
                    ) : (
                        notifications.map((n) => (
                            <React.Fragment key={n.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    onClick={() => handleNotificationClick(n.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: n.is_read ? 'transparent' : alpha(theme.palette.primary.main, 0.03),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <Box sx={{
                                        mr: 2,
                                        mt: 0.5,
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: n.notification_type === 'VISA_EXPIRY' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                        display: 'grid',
                                        placeItems: 'center'
                                    }}>
                                        {n.notification_type === 'VISA_EXPIRY' ? <VisaIcon sx={{ color: 'error.main', fontSize: 20 }} /> : <NotificationsIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
                                    </Box>
                                    <ListItemText
                                        disableTypography
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <Typography variant="body2" fontWeight={n.is_read ? 600 : 800} color="#1E293B">
                                                    {n.title}
                                                </Typography>
                                                {!n.is_read && <CircleIcon sx={{ color: 'primary.main', fontSize: 8 }} />}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                                    {n.message}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
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

                {notifications.length > 5 && (
                    <Box sx={{ p: 1.5, textAlign: 'center' }}>
                        <Button fullWidth size="small" variant="text" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            View all notifications
                        </Button>
                    </Box>
                )}
            </Menu>
        </Box>
    );
}
