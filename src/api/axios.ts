import { API_CONFIG } from "@/api/constants";
import axios from "axios";
import toast from "react-hot-toast";


export const api = axios.create({

    baseURL: API_CONFIG.BASE_URL,

    timeout: API_CONFIG.TIMEOUT,

    withCredentials:true

});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Impossible de contacter le serveur.");
      return Promise.reject(error);
    }

    const status = error.response.status;
    const message =
      error.response.data?.message || "Une erreur est survenue.";

    switch (status) {
      case 400:
        toast.error(message);
        break;

      case 401:
        console.log("Veillez-vous connecter")
        break;

      case 403:
        toast.error("Accès refusé.");
        break;

      case 404:
        toast.error("Ressource introuvable.");
        break;

      case 409:
        toast.error(message);
        break;

      case 500:
        toast.error("Erreur interne du serveur.");
        break;

      default:
        toast.error(message);
    }

    return Promise.reject(error);
  }
);