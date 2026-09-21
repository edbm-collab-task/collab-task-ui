function UserProfileSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="h-80 w-full bg-gray-200" />

                <div className="px-6 pb-6">
                    <div className="-mt-16 flex items-end gap-5">
                        <div className="relative shrink-0">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-gray-200 shadow-md" />

                            <div className="absolute bottom-1 right-1 h-9 w-9 rounded-full border-2 border-white bg-gray-300" />
                        </div>

                        <div className="flex min-w-0 flex-1 items-center justify-between pb-2">
                            <div className="min-w-0 space-y-3">
                                <div className="h-7 w-56 rounded-md bg-gray-200" />

                                <div className="h-4 w-72 rounded-md bg-gray-200" />
                            </div>

                            <div className="ml-4 h-9 w-10 shrink-0 rounded-lg bg-gray-200" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-52 rounded-md bg-gray-200" />

                        <div className="h-4 w-72 rounded-md bg-gray-200" />
                    </div>

                    <div className="h-9 w-10 rounded-lg bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3"
                        >
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200" />

                            <div className="space-y-2">
                                <div className="h-3 w-24 rounded bg-gray-200" />

                                <div className="h-4 w-36 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-40 rounded-md bg-gray-200" />

                        <div className="h-4 w-64 rounded-md bg-gray-200" />
                    </div>

                    <div className="flex gap-3">
                        <div className="h-7 w-28 rounded-full bg-gray-200" />

                        <div className="h-7 w-24 rounded-full bg-gray-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfileSkeleton;