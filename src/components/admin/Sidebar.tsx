import { NavLink } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import { X } from "lucide-react";
import { menus } from "./AdminNavigation.config.ts"
import logo from "../../assets/logo.png";


interface Props {
    open: boolean;
    close: () => void;
    collapsed: boolean;
    expand: () => void;
}

export default function Sidebar({ open, close, collapsed, expand }: Props) {

    return (
        <>
            {open && (
                <div
                    onClick={close}
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                />
            )}

            <aside
                className={`group/sb fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col bg-primary text-white shadow-2xl transition-all duration-300 lg:static lg:translate-x-0 ${
                    collapsed ? "lg:w-20 lg:hover:w-72" : "lg:w-72"
                } ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >

                <div className={`flex h-20 items-center justify-between py-10 px-8 transition-all duration-300 ${
                    collapsed ? "lg:justify-start lg:px-4 lg:group-hover/sb:justify-center lg:group-hover/sb:px-8" : "lg:justify-center lg:px-8"
                }`}>

                    <NavLink
                        to={menus[0].path}
                        end={menus[0].path === "/admin"}
                        className={`flex w-full mt-5 items-center justify-center transition-all duration-300 ${
                            collapsed ? "lg:justify-start lg:group-hover/sb:justify-center" : ""
                        }`}
                    >
                        <img
                            src={logo}
                            alt="CollaB Tasks"
                            className={`h-26 w-auto transition-all duration-300 ${
                                collapsed ? "lg:h-10 lg:group-hover/sb:h-26" : "lg:h-26"
                            }`}
                        />
                    </NavLink>

                    <button
                        onClick={close}
                        className="text-white/50 lg:hidden"
                    >
                        <X size={24} />
                    </button>

                </div>

                <AdminMenu collapsed={collapsed} expand={expand} />

            </aside>
        </>
    );
}