export default function VerificationPageSkeleton() {


    return (

        <div className="min-h-screen  bg-gray-200 from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">

            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-gray-200 shadow-2xl md:grid-cols-2">

                {/* Partie gauche */}

                <div className="hidden  bg-gray-200 p-12 text-white md:flex md:flex-col md:items-center md:justify-center">
                </div>

                {/* Partie droite */}

                <div className="flex  bg-gray-200 items-center justify-center p-10">

                </div>

            </div>

        </div>

    );

}