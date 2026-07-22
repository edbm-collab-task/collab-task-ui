/* Import de React */
import React from "react";

/* Permet d'afficher l'application dans le navigateur */
import ReactDOM from "react-dom/client";

/* Import du système de navigation */
import { BrowserRouter } from "react-router-dom";

/* Import du composant principal */
import App from "./App";

/* Import des styles globaux */
import "./styles/index.css";

/* On affiche l'application dans la balise <div id="root"></div> */
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>

        {/* BrowserRouter active la navigation entre les pages */}
        <BrowserRouter>

            <App />

        </BrowserRouter>

    </React.StrictMode>
);