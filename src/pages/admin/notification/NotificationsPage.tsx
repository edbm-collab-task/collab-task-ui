import { useEffect, useState } from "react";
import { Bell, CheckCheck, ArrowLeft, UserPlus, ClipboardList, AlertTriangle, AlarmClock, Hourglass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification/notification.service";
import type { Notification } from "@/types/notification";
import Spinner from "@/components/common/Spinner";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getAll();
            setNotifications(data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n));
        } catch {
            // silent
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch {
            // silent
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
            case "CONTRIBUTOR_ADDED": return UserPlus;
            case "TASK_ASSIGNED": return ClipboardList;
            case "PRIORITY_CHANGED": return AlertTriangle;
            case "PROJECT_DEADLINE": return AlarmClock;
            case "TASK_DEADLINE": return Hourglass;
            default: return Bell;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-xl p-2 text-primary/70 transition-colors hover:bg-secondary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <Bell size={24} className="text-primary" />
                    <h1 className="text-2xl font-bold text-primary">Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="ml-auto flex items-center gap-2 rounded-xl bg-secondary/60 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <CheckCheck size={16} />
                        Tout marquer lu ({unreadCount})
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner size={32} className="text-primary" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-secondary/60 bg-white py-16 text-center shadow-sm">
                    <Bell size={48} className="mx-auto mb-4 text-primary/30" />
                    <p className="text-primary/60">Aucune notification pour le moment</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notif => {
                        const Icon = getIcon(notif.type);
                        return (
                        <div
                            key={notif.notificationId}
                            onClick={() => {
                                if (!notif.isRead) handleMarkAsRead(notif.notificationId);
                                if (notif.projectId) navigate(`/admin/projects/${notif.projectId}`);
                            }}
                            className={`flex items-start gap-4 rounded-2xl border p-4 transition-colors cursor-pointer ${
                                !notif.isRead
                                    ? "border-secondary bg-secondary/30 hover:bg-secondary/50"
                                    : "border-secondary/60 bg-white hover:bg-secondary/20"
                            }`}
                        >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/40 text-primary ring-1 ring-secondary">
                                <Icon size={18} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm leading-snug ${!notif.isRead ? "font-semibold text-primary" : "text-primary/70"}`}>
                                    {notif.message}
                                </p>
                                <p className="mt-1 text-xs text-primary/50">{formatTime(notif.createdAt)}</p>
                            </div>
                            {!notif.isRead && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                            )}
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
