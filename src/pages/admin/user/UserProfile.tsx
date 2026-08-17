import { useEffect, useState, useRef } from "react";
import {
    Camera,
    Pencil,
    Mail,
    Phone,
    BriefcaseBusiness,
    User,
    ShieldCheck,
    Building2,
    CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuth from "@/hooks/useAuth";
import { authService } from "@/services/auth/auth.service";
import { userService } from "@/services/user/user.service";

import {
    API_CONFIG,
    API_ENDPOINTS
} from "@/api/constants";

import type { Email } from "@/types/email";
import type { UserProfile } from "@/types/user";

function UserProfileSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="h-80 w-full bg-gray-200" />

                <div className="px-6 pb-6">
                    <div className="-mt-16 flex items-end gap-5">
                        <div className="relative shrink-0">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 shadow-md" />

                            <div className="absolute bottom-1 right-1 h-9 w-9 rounded-full border-2 border-white bg-gray-300" />
                        </div>

                        <div className="flex min-w-0 flex-1 items-center justify-between pb-2">
                            <div className="min-w-0 space-y-3">
                                <div className="h-7 w-56 rounded-md bg-gray-200" />

                                <div className="h-4 w-72 rounded-md bg-gray-200" />
                            </div>

                            <div className="ml-4 h-9 w-10 shrink-0 rounded-lg bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-52 rounded-md bg-gray-200" />

                        <div className="h-4 w-72 rounded-md bg-gray-200" />
                    </div>

                    <div className="h-9 w-10 rounded-lg bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3"
                        >
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />

                            <div className="space-y-2">
                                <div className="h-3 w-24 rounded bg-gray-200" />

                                <div className="h-4 w-36 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-40 rounded-md bg-gray-200" />

                        <div className="h-4 w-64 rounded-md bg-gray-200" />
                    </div>

                    <div className="flex gap-3">
                        <div className="h-7 w-28 rounded-full bg-gray-200" />

                        <div className="h-7 w-24 rounded-full bg-gray-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function UserProfile() {
    const [userDetails, setUserDetails] =
        useState<UserProfile | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const { user } = useAuth();

    const navigate = useNavigate();

    const fileInputRef =
        useRef<HTMLInputElement | null>(null);

    const loadUserDetails = async (
        showLoading = false
    ) => {
        if (!user?.email) {
            return;
        }

        try {
            if (showLoading) {
                setLoading(true);
            }

            const emailData: Email = {
                email: user.email
            };

            const response =
                await authService.searchUserByEmail(
                    emailData
                );

            setUserDetails(response);
        } catch (error) {
            console.error(
                "Erreur lors de la récupération du profil :",
                error
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!user?.email) {
            return;
        }

        loadUserDetails(true);

        const interval = setInterval(() => {
            loadUserDetails(false);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [user?.email]);

    const handleEditPhoto = () => {
        if (uploadingImage) {
            return;
        }

        fileInputRef.current?.click();
    };

    const handleImageChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file || !userDetails?.id) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            console.error(
                "Le fichier sélectionné n'est pas une image."
            );

            event.target.value = "";

            return;
        }

        try {
            setUploadingImage(true);

            await userService.addImageToUser(
                userDetails.id,
                file
            );

            await loadUserDetails(false);
        } catch (error) {
            console.error(
                "Erreur lors de la modification de la photo :",
                error
            );
        } finally {
            setUploadingImage(false);

            event.target.value = "";
        }
    };

    const handleEditProfile = () => {
        if (!userDetails?.id) {
            return;
        }

        navigate(
            `/admin/users/${userDetails.id}/edit`
        );
    };

    if (!user) {
        return null;
    }

    if (loading) {
        return <UserProfileSkeleton />;
    }

    if (!userDetails) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Impossible de récupérer les informations du profil.
                </p>
            </div>
        );
    }

    const imageUrl =
        userDetails.id &&
        userDetails.imagePath
            ? `${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userDetails.id}/image`
            : null;

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="relative w-full overflow-hidden rounded-t-xl bg-gray-100">
                    <img
                        src="/edbm.png"
                        alt="Cover"
                        className="block h-80 w-full"
                    />
                </div>

                <div className="px-6 pb-6">
                    <div className="-mt-16 flex items-end gap-5">
                        <div className="relative shrink-0">
                            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
                                {imageUrl ? (
                                    <img
                                        src={`${imageUrl}?t=${Date.now()}`}
                                        alt={`${userDetails.firstname} ${userDetails.lastname}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User
                                        size={48}
                                        strokeWidth={1.5}
                                        className="text-gray-400"
                                    />
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={handleEditPhoto}
                                disabled={uploadingImage}
                                title="Modifier la photo de profil"
                                className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white shadow-md transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {uploadingImage ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Camera size={17} />
                                )}
                            </button>
                        </div>

                        <div className="flex min-w-0 flex-1 items-center justify-between pb-2">
                            <div className="min-w-0">
                                <h1 className="truncate text-2xl font-semibold text-gray-900">
                                    {userDetails.firstname}{" "}
                                    {userDetails.lastname}
                                </h1>

                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                    <Mail size={16} />

                                    <span className="truncate">
                                        {userDetails.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Informations personnelles
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Informations associées à votre compte
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleEditProfile}
                        title="Modifier les informations"
                        className="flex items-center gap-2 rounded-lg border-none px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <Pencil size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <User size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Nom complet
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {userDetails.firstname}{" "}
                                {userDetails.lastname}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <Mail size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Adresse email
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {userDetails.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <Phone size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Numéro
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {userDetails.number || "Non renseigné"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <User size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Genre
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {userDetails.gender === "M"
                                    ? "Masculin"
                                    : userDetails.gender === "F"
                                        ? "Féminin"
                                        : "Non renseigné"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <Building2 size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Direction
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {userDetails.direction || "Non renseignée"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <BriefcaseBusiness size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Poste
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {userDetails.job || "Non renseigné"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <ShieldCheck size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Rôle
                            </p>

                            <div className="mt-1">
                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                    {userDetails.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <CalendarDays size={19} />
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Compte créé le
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                                {new Date(
                                    userDetails.createdAt
                                ).toLocaleDateString(
                                    "fr-FR",
                                    {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric"
                                    }
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            Statut du compte
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            État actuel de votre compte utilisateur
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                                userDetails.isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                            }`}
                        >
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    userDetails.isActive
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                }`}
                            />

                            {userDetails.isActive
                                ? "Compte actif"
                                : "Compte désactivé"}
                        </span>

                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                                userDetails.status
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {userDetails.status
                                ? "En ligne"
                                : "Hors ligne"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}