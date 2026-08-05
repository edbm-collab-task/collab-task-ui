
export default function Dashboard() {
    return (
        <div>
            <h2 className="mb-6 text-3xl font-bold">
                Dashboard
            </h2>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl bg-white p-6 shadow">
                    <h3 className="text-gray-500">Utilisateurs</h3>
                    <p className="mt-2 text-3xl font-bold">245</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <h3 className="text-gray-500">Super Administrateurs</h3>
                    <p className="mt-2 text-3xl font-bold">18</p>
                </div>

                <div className="rounded-xl bg-white p-6 shadow">
                    <h3 className="text-gray-500">Administrateurs</h3>
                    <p className="mt-2 text-3xl font-bold">4</p>
                </div>
            </div>

            <div className="mt-8 rounded-xl bg-white p-6 shadow">
                Historique...
            </div>
        </div>
    );
}