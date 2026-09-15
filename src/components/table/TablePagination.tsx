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

        <div className="flex flex-col items-center justify-between gap-3 px-1 py-4 sm:flex-row sm:px-2">


            <p className="text-sm text-primary/60">
                Page <span className="font-semibold text-primary">{page}</span> sur <span className="font-semibold text-primary">{totalPages}</span>
            </p>


            <div className="flex items-center gap-2">


                <button
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    className="rounded-xl border border-secondary/60 bg-secondary/30 px-4 py-2 text-sm font-medium text-primary/70 transition-colors hover:bg-secondary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Précédent
                </button>


                <div className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm">
                    {page}
                </div>


                <button
                    disabled={page === totalPages}
                    onClick={() => onChange(page + 1)}
                    className="rounded-xl border border-secondary/60 bg-secondary/30 px-4 py-2 text-sm font-medium text-primary/70 transition-colors hover:bg-secondary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Suivant
                </button>


            </div>


        </div>

    );

}