import { Menu } from "lucide-react";
import UserDropdown from "../user/UserDropdown";
import NotificationBell from "../notification/NotificationBell";

interface Props {
    toggleSidebar: () => void;
}

export default function Navbar({ toggleSidebar }: Props) {
    return (
        <header className="flex  h-20 w-full items-center justify-between border-none bg-primary px-6 shadow-sm">

            {/* Left */}
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="rounded-lg p-2 text-secondary transition hover:bg-secondary hover:text-primary lg:hidden"
                >
                    <Menu size={25} />
                </button>
            </div>


            {/* Right */}
            <div className="ml-auto text-secondary flex items-center gap-2">
                <NotificationBell/>
                <UserDropdown />
            </div>

        </header>
    );
}
