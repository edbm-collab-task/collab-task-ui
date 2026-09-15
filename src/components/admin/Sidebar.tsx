import { NavLink } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import { X } from "lucide-react";
import {menus} from "./AdminNavigation.config.ts"
import logo from "../../assets/logo.png";


interface Props {
    open: boolean;
    close: () => void;
}

export default function Sidebar({ open, close }: Props) {

    return (
        <>
            {open && (
                <div
                    onClick={close}
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-primary text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >

                <div className="flex h-20  items-center justify-between border-b border-secondary px-8">
                    
                    <NavLink 
                        to={menus[0].path} 
                        end={menus[0].path === "/admin"}
                        className="flex justify-center items-center w-full"
                    >
                        <img 
                            src={logo} 
                            alt="CollaB Tasks" 
                            className="h-26 w-auto" 
                        />
                    </NavLink>

                    <button
                        onClick={close}
                        className="text-white/50 lg:hidden"
                    >
                        <X size={24} />
                    </button>

                </div>

                <AdminMenu />

            </aside>
        </>
    );
}