import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, UserPlus, ClipboardList, AlertTriangle, AlarmClock, Hourglass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification/notification.service";
import type { Notification } from "@/types/notification";
import { formatRelativeTime } from "@/utils/time";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useToggle } from "@/hooks/useToggle";

export default function NotificationBell() {
    const [open, toggleOpen, setOpen] = useToggle();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const loadNotifications = useCallback(async () => {
        try {
            const [notifs, count] = await Promise.all([
                notificationService.getAll(),
                notificationService.getUnreadCount(),
            ]);
            setNotifications(notifs.slice(0, 10));
            setUnreadCount(count);
        } catch {
            // silent
        }
    }, []);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    const closeDropdown = useCallback(() => setOpen(false), [setOpen]);

    // Hook pour fermer le dropdown au clic en dehors
    const dropdownRef = useClickOutside<HTMLDivElement>(closeDropdown, open);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // silent
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {
            // silent
        }
    };

    const handleNotificationClick = (notif: Notification) => {
        if (!notif.isRead) handleMarkAsRead(notif.notificationId);
        setOpen(false);
        if (notif.projectId) {
            navigate(`/admin/projects/${notif.projectId}`);
        }
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "CONTRIBUTOR_ADDED": return UserPlus;
            case "TASK_ASSIGNED": return ClipboardList;
            case "PRIORITY_CHANGED": return AlertTriangle;
            case "PROJECT_DEADLINE": return AlarmClock;
            case "TASK_DEADLINE": return Hourglass;
            default: return Bell;
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={toggleOpen}
                className="relative rounded-xl p-2 text-secondary transition-colors duration-150 hover:bg-secondary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-primary">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto rounded-2xl border border-secondary/60 bg-white shadow-lg">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-secondary/60 bg-white px-4 py-3">
                        <h3 className="text-sm font-semibold text-primary">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary/70 transition-colors hover:bg-secondary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            >
                                <CheckCheck size={14} />
                                Tout marquer lu
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-primary/50">
                            Aucune notification
                        </div>
                    ) : (
                        <div className="divide-y divide-secondary/20">
                            {notifications.map(notif => {
                                const Icon = getIcon(notif.type);
                                return (
                                <button
                                    key={notif.notificationId}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-secondary/40 ${!notif.isRead ? "bg-secondary/30" : ""}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/40 text-primary ring-1 ring-secondary">
                                            <Icon size={18} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm leading-snug ${!notif.isRead ? "font-semibold text-primary" : "text-primary/70"}`}>
                                                {notif.message}
                                            </p>
                                            <p className="mt-1 text-xs text-primary/50">{formatRelativeTime(notif.createdAt)}</p>
                                        </div>
                                        {!notif.isRead && (
                                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                                        )}
                                    </div>
                                </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="sticky bottom-0 border-t border-secondary/60 bg-white px-4 py-2.5">
                        <button
                            onClick={() => { setOpen(false); navigate("/admin/notifications"); }}
                            className="w-full rounded-xl bg-secondary/40 py-2.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            Voir toutes les notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
