import { useEffect, useState } from "react";
import { Bell, CheckCheck, ArrowLeft } from "lucide-react";
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
            case "CONTRIBUTOR_ADDED": return "👤";
            case "TASK_ASSIGNED": return "📋";
            case "PRIORITY_CHANGED": return "🔴";
            case "PROJECT_DEADLINE": return "⏰";
            case "TASK_DEADLINE": return "⏳";
            default: return "🔔";
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <Bell size={24} className="text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="ml-auto flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                    >
                        <CheckCheck size={16} />
                        Tout marquer lu ({unreadCount})
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner size={32} className="text-blue-500" />
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Aucune notification pour le moment</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(notif => (
                        <div
                            key={notif.notificationId}
                            onClick={() => {
                                if (!notif.isRead) handleMarkAsRead(notif.notificationId);
                                if (notif.projectId) navigate(`/admin/projects/${notif.projectId}`);
                            }}
                            className={`flex items-start gap-4 rounded-xl border p-4 transition cursor-pointer ${
                                !notif.isRead
                                    ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                        >
                            <span className="mt-0.5 text-2xl">{getIcon(notif.type)}</span>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm leading-snug ${!notif.isRead ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                                    {notif.message}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">{formatTime(notif.createdAt)}</p>
                            </div>
                            {!notif.isRead && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
