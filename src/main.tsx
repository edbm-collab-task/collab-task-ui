import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";
import AuthProvider from "@/contexts/AuthProvider";
import PermissionActionsProvider from "@/contexts/PermissionActionsProvider";
import RecoveryAuthProvider from "@/contexts/RecoveryAuthProvider";

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <PermissionActionsProvider>
                    <RecoveryAuthProvider>
                        <App />
                        <Toaster position="top-right" />
                    </RecoveryAuthProvider>
                </PermissionActionsProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);