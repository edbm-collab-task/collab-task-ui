import Swal from "sweetalert2";

export async function confirmDelete(
    element: string
): Promise<boolean> {

    const confirmation = await Swal.fire({
        title: "Supprimer ?",

        html: `
            <div class="text-sm text-gray-500 -mt-2">
                Voulez-vous supprimer
                <span class="font-semibold text-gray-800">
                    cet ${element}
                </span> ?
            </div>
        `,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "Oui",
        cancelButtonText: "Non",

        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",

        reverseButtons: true,

        width: "340px",
        padding: "1rem",

        customClass: {
            popup: "rounded-xl",

            title: "text-lg font-semibold !mb-1 !p-0",

            htmlContainer: "!mt-0 !mb-2 !px-2",

            actions: "!mt-2 !gap-2",

            confirmButton:
                "!m-0 rounded-lg px-4 py-2 text-sm font-medium",

            cancelButton:
                "!m-0 rounded-lg px-4 py-2 text-sm font-medium",
        },
    });

    if (!confirmation.isConfirmed) {
        return false;
    }

    const confirmationText = `SUPPRIMER ${element}`;

    const result = await Swal.fire({
        title: "Confirmation finale",

        html: `
            <div class="text-sm text-gray-500 -mt-2">

                <p class="!mb-2">
                    Saisissez exactement :
                </p>

                <div class="inline-block rounded-md bg-gray-100 px-3 py-1.5">
                    <span class="font-semibold text-gray-800">
                        ${confirmationText}
                    </span>
                </div>

            </div>
        `,

        input: "text",

        inputPlaceholder: confirmationText,

        showCancelButton: true,

        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler",

        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",

        reverseButtons: true,

        width: "340px",
        padding: "1rem",

        customClass: {
            popup: "rounded-xl",

            title: "text-lg font-semibold !mb-1 !p-0",

            htmlContainer: "!mt-0 !mb-2 !px-2",

            input:
                "!mt-1 !mb-2 !h-10 !rounded-lg !border-gray-300 text-sm",

            actions: "!mt-2 !gap-2",

            confirmButton:
                "!m-0 rounded-lg px-4 py-2 text-sm font-medium",

            cancelButton:
                "!m-0 rounded-lg px-4 py-2 text-sm font-medium",
        },

        inputAttributes: {
            autocomplete: "off",
            autocapitalize: "off",
        },

        preConfirm: (value) => {

            if (value !== confirmationText) {

                Swal.showValidationMessage(
                    `Saisissez exactement : ${confirmationText}`
                );

                return false;
            }

            return true;
        },
    });

    return result.isConfirmed && result.value === true;
}