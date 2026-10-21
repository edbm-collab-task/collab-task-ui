import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useToggle } from "@/hooks/useToggle";
import { requestSessionResync } from "@/services/auth/sessionSync";

export default function AdminLayout() {

    const [sidebarOpen, toggleSidebar, setSidebarOpen] = useToggle();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    /**
     * Resynchronise les droits à chaque ouverture du sidebar (bouton
     * hamburger, mobile) : les menus reflètent les dernières permissions
     * avant que l'utilisateur ne navigue.
     *
     * Sur desktop, la barre étant toujours visible, le geste d'ouverture
     * est le survol du rail — c'est `Sidebar` qui émet alors la demande. Les
     * deux déclencheurs partagent le budget de 5 s propre à la raison
     * « sidebar » (voir `sessionSync`) : ils ne provoquent qu'un seul appel.
     */
    useEffect(() => {
        if (sidebarOpen) requestSessionResync("sidebar");
    }, [sidebarOpen]);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                close={() => setSidebarOpen(false)}
                collapsed={sidebarCollapsed}
                expand={() => setSidebarCollapsed(false)}
            />


            <div
                className="flex flex-1 flex-col overflow-hidden"
                onClick={() => {
                    if (window.matchMedia("(min-width: 1024px)").matches) {
                        setSidebarCollapsed(true);
                    }
                }}
            >

                {/* Navbar */}
                <Navbar
                    toggleSidebar={toggleSidebar}
                />


                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}