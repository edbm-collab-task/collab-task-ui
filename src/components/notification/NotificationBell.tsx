import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification/notification.service";
import type { Notification } from "@/types/notification";

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "à l'instant";
        if (minutes < 60) return `il y a ${minutes}min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        return `il y a ${days}j`;
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "CONTRIBUTOR_ADDED": return "👤";
            case "TASK_ASSIGNED": return "📋";
            case "PRIORITY_CHANGED": return "🔴";
            case "PROJECT_DEADLINE": return "⏰";
            case "TASK_DEADLINE": return "⏳";
            default: return "🔔";
        }
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-white shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                                <CheckCheck size={14} />
                                Tout marquer lu
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">
                            Aucune notification
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map(notif => (
                                <button
                                    key={notif.notificationId}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left px-4 py-3 transition hover:bg-gray-50 ${!notif.isRead ? "bg-blue-50/50" : ""}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 text-lg">{getIcon(notif.type)}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-sm leading-snug ${!notif.isRead ? "font-medium text-gray-900" : "text-gray-600"}`}>
                                                {notif.message}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-400">{formatTime(notif.createdAt)}</p>
                                        </div>
                                        {!notif.isRead && (
                                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-gray-100 px-4 py-2">
                        <button
                            onClick={() => { setOpen(false); navigate("/admin/notifications"); }}
                            className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                            Voir toutes les notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
