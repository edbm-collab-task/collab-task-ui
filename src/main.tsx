import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App";
import AuthProvider from "@/contexts/AuthProvider";

const root = createRoot(document.getElementById("root")!);

root.render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster position="top-right" />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);