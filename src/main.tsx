import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {Toaster} from "react-hot-toast";

import "./index.css";
import App from "./App";
import AuthProvider from "@/contexts/AuthProvider";
import RecoveryAuthProvider from "@/contexts/RecoveryAuthProvider";


createRoot(document.getElementById("root")!).render(

    <StrictMode>

        <BrowserRouter>

             <AuthProvider>

                <RecoveryAuthProvider>

                    <Toaster position="top-right" />

                    <App />

                </RecoveryAuthProvider>

            </AuthProvider>

        </BrowserRouter>

    </StrictMode>

);