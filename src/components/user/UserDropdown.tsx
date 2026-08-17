import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";

import useAuth from "@/hooks/useAuth";
import { authService } from "@/services/auth/auth.service";
import { API_CONFIG, API_ENDPOINTS } from "@/api/constants";

import type { Email } from "@/types/email";
import type { UserResponse } from "@/types/user";
import { useNavigate } from "react-router-dom";

export default function UserDropdown() {
    const [open, setOpen] = useState(false);
    const [userDetails, setUserDetails] = useState<UserResponse | null>(null);
     const navigate = useNavigate();

    const dropdownRef = useRef<HTMLDivElement>(null);

    const { user, logout } = useAuth();


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!user?.email) {
            return;
        }

        const loadUserDetails = async () => {
            try {
                const emailData: Email = {
                    email: user.email,
                };

                const response =
                    await authService.searchUserByEmail(emailData);

                setUserDetails(response);
                window.dispatchEvent(new Event("user-profile-updated"));
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération de l'utilisateur :",
                    error
                );
            }
        };

        loadUserDetails();
    }, [user?.email]);


        loadUserDetails();
    }, [user?.email]);

    /**
     * Aucun utilisateur connecté
     */
    if (!user) {
        return null;
    }

    const currentUser = userDetails ?? user;

    const imageUrl =
        userDetails?.id && userDetails?.imagePath
            ? `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userDetails.id}/image`
            : null;

    return (
        <div ref={dropdownRef} className="relative">

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-100"
            >
    
                <div className="relative">

                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={`${currentUser.firstname} ${currentUser.lastname}`}
                            className="h-11 w-11 rounded-full object-cover"
                        />
                    ) : (
                        /* Pas encore d'image */
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <User
                                size={24}
                                strokeWidth={1.8}
                            />
                        </div>
                    )}

                    {/* Statut en ligne */}
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                </div>

                {/* Informations utilisateur */}
                <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-gray-800">
                        {currentUser.firstname} {currentUser.lastname}
                    </p>

                    <p className="text-xs text-green-600">
                        En ligne
                    </p>
                </div>

                {/* Chevron */}
                <ChevronDown
                    size={18}
                    className={`transition ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* =========================
                Dropdown
            ========================== */}
            {open && (
                <div className="absolute right-0 z-50 mt-3 w-60 rounded-xl bg-white p-2 shadow-xl">

                    {/* Informations */}
                    <div className="border-b px-3 py-3">
                        <p className="font-semibold text-gray-800">
                            {currentUser.firstname}{" "}
                            {currentUser.lastname}
                        </p>

                        <p className="text-sm text-gray-500">
                            {currentUser.role}
                        </p>
                    </div>

                    {/* Profil */}
                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
                        onClick={ () => {
                            navigate("/admin/users/profile")
                        }}
                    >
                        <User size={18} />
                        Profil
                    </button>

                    {/* Paramètres */}
                    <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition hover:bg-gray-100"
                     onClick={ () => {
                            navigate("/admin/users/change-pwd")
                        }}
                   >
                        <Settings size={18} />
                       Sécurité du compte
                    </button>

                    {/* Déconnexion */}
                    <button
                        type="button"
                        onClick={async () => {
                            await logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            )}
        </div>
    );
}