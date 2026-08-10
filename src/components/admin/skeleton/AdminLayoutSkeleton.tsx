export default function AdminLayoutSkeleton() {

    return (

        <div className="flex h-screen border-none overflow-hidden bg-gray-100 animate-pulse">


            {/* Sidebar */}
            <aside className="hidden border-none md:flex w-64 flex-col bg-white border-r p-5">


                {/* Logo */}
                <div className="h-10 w-32 border-noe bg-gray-200 rounded mb-8"></div>


                {/* Menu */}
                <div className="space-y-4 border-none">

                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>

                </div>


            </aside>



            {/* Main */}
            <div className="flex flex-1 border-none flex-col overflow-hidden">



                {/* Navbar */}
                <header className="h-16 border-none bg-white border-b flex items-center justify-between px-6">


                    {/* Menu button */}
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>



                    {/* User */}
                    <div className="flex items-center gap-4">

                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>

                        <div className="h-8 w-24 bg-gray-200 rounded"></div>

                    </div>


                </header>




                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">


                    <div className="space-y-6">


                        {/* Page title */}
                        <div className="h-8 w-52 bg-gray-200 rounded"></div>



                        {/* Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                            <div className="h-32 bg-gray-200 rounded-xl"></div>

                            <div className="h-32 bg-gray-200 rounded-xl"></div>

                            <div className="h-32 bg-gray-200 rounded-xl"></div>


                        </div>




                        {/* Table */}
                        <div className="bg-white rounded-xl p-5 space-y-4">


                            <div className="h-10 bg-gray-200 rounded"></div>

                            <div className="h-10 bg-gray-200 rounded"></div>

                            <div className="h-10 bg-gray-200 rounded"></div>

                            <div className="h-10 bg-gray-200 rounded"></div>


                        </div>


                    </div>


                </main>



            </div>



        </div>

    );
}