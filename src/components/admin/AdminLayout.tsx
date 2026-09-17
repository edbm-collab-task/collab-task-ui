import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">

            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                close={() => setSidebarOpen(false)}
                collapsed={sidebarCollapsed}
                collapse={() => setSidebarCollapsed(true)}
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
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />


                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}