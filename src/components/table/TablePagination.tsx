interface Props {

    page: number;

    totalPages: number;

    onChange: (page: number) => void;

}


export default function TablePagination({
    page,
    totalPages,
    onChange
}: Props) {


    return (

        <div className="flex items-center justify-between px-2 py-4">


            <p className="text-sm text-gray-600">
                Page <span className="font-semibold text-blue-600">{page}</span> sur <span className="font-semibold text-blue-600">{totalPages}</span>
            </p>


            <div className="flex items-center gap-2">


                <button
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Précédent
                </button>


                <div className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
                    {page}
                </div>


                <button
                    disabled={page === totalPages}
                    onClick={() => onChange(page + 1)}
                    className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Suivant
                </button>


            </div>


        </div>

    );

}