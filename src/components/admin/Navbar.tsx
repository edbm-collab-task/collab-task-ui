import { Menu } from "lucide-react";
import UserDropdown from "./UserDropdown";

interface Props {
    toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: Props) {
    return (
        <header className="flex  h-16 w-full items-center justify-between border-none bg-white px-6 shadow-sm">

            {/* Left */}
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
                >
                    <Menu size={25} />
                </button>
            </div>


            {/* Right */}
            <div className="ml-auto flex items-center">
                <UserDropdown />
            </div>

        </header>
    );
}