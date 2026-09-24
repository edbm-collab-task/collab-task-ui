import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useToggle } from "@/hooks/useToggle";

export default function AdminLayout() {

    const [sidebarOpen, toggleSidebar, setSidebarOpen] = useToggle();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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