import AdminMenu from "./AdminMenu";
import { X } from "lucide-react";

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
                className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-[#270f2a] text-white shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >

                <div className="flex h-20  items-center justify-between border-b border-slate-600 px-8">

                    <h1 className="text-white bg-clip-text text-3xl font-extrabold ">
                        CollaB Tasks
                    </h1>

                    <button
                        onClick={close}
                        className="text-gray-300 lg:hidden"
                    >
                        <X size={24} />
                    </button>

                </div>

                <AdminMenu />

            </aside>
        </>
    );
}