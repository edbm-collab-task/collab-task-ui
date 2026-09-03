import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import "./index.css";
import App from "./App";
import AuthProvider from "@/contexts/AuthProvider";
import RecoveryAuthProvider from "@/contexts/RecoveryAuthProvider";


const root = createRoot(document.getElementById("root")!);

root.render(

    <StrictMode>

        <BrowserRouter>

             <AuthProvider>

                <RecoveryAuthProvider>

                    <App />

                </RecoveryAuthProvider>

            </AuthProvider>

        </BrowserRouter>

    </StrictMode>

);

const toastContainer = document.createElement("div");
document.body.appendChild(toastContainer);
createRoot(toastContainer).render(<Toaster position="top-right" />);