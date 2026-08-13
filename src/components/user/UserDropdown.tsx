import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function UserDropdown() {

    const [open, setOpen] = useState(false);

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


    if (!user) {
        return null;
    }


    return (
        <div ref={dropdownRef} className="relative">

            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-100"
            >

                <div className="relative">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-blue-500 font-bold text-white">
                        {user.firstname[0]}
                        {user.lastname[0]}
                    </div>


                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500">
                    </span>

                </div>


                <div className="hidden text-left md:block">

                    <p className="text-sm font-semibold text-gray-800">
                        {user.firstname} {user.lastname}
                    </p>


                    <p className="text-xs text-green-600">
                        En ligne
                    </p>

                </div>


                <ChevronDown
                    size={18}
                    className={`transition ${open ? "rotate-180" : ""}`}
                />

            </button>


            {open && (

                <div className="absolute right-0 z-50 mt-3 w-60 rounded-xl bg-white p-2 shadow-xl">


                    <div className="border-b px-3 py-3">

                        <p className="font-semibold text-gray-800">
                            {user.firstname} {user.lastname}
                        </p>


                        <p className="text-sm text-gray-500">
                            {user.role}
                        </p>

                    </div>


                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
                        <User size={18} />
                        Profil
                    </button>


                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100">
                        <Settings size={18} />
                        Paramètres
                    </button>


                    <button
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