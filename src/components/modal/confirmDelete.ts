import Swal from "sweetalert2";

const PRIMARY_COLOR = "#6d526f";

export async function confirmDelete(
    element: string
): Promise<boolean> {

    const confirmation = await Swal.fire({

        html: `
            <style>
                .swal2-icon.swal2-warning {
                    color: ${PRIMARY_COLOR};
                    border-color: ${PRIMARY_COLOR};
                }
            </style>
            <div class="text-sm text-gray-500 -mt-2">
                Voulez-vous
                <span class="font-semibold text-gray-800">
                    ${element}
                </span> ?
            </div>
        `,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "Oui",
        cancelButtonText: "Non",

        reverseButtons: true,

        width: "340px",
        padding: "1rem",

        customClass: {
            popup: "rounded-xl",

            title: "text-lg font-semibold !mb-1 !p-0",

            htmlContainer: "!mt-0 !mb-2 !px-2",

            actions: "!mt-2 !gap-2",

            confirmButton:
                "!m-0 !rounded-lg !bg-primary hover:!bg-accent !px-4 !py-2 !text-sm !font-medium !text-white !border-0 !outline-none focus:!outline-none focus:!ring-0",

            cancelButton:
                "!m-0 !rounded-lg !bg-secondary hover:!bg-accent !px-4 !py-2 !text-sm !font-medium !text-blue-600 !border-0 !outline-none focus:!outline-none focus:!ring-0",
        },
    });


    if (!confirmation.isConfirmed) {
        return false;
    }


    // Première lettre en majuscule
    const confirmationText =
        element.charAt(0).toUpperCase() + element.slice(1);


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

        confirmButtonText: "Confirmer",
        cancelButtonText: "Annuler",

        reverseButtons: true,

        width: "340px",
        padding: "1rem",

        customClass: {
            popup: "rounded-xl",

            title: "text-lg font-semibold !mb-1 !p-0",

            htmlContainer: "!mt-0 !mb-2 !px-2",

            input:
                "!mt-1 !mb-2 !h-10 !rounded-lg !border-gray-300 !text-sm focus:!border-blue-500 focus:!ring-blue-500",

            actions: "!mt-2 !gap-2",

            confirmButton:
                "!m-0 !rounded-lg !bg-primary hover:!bg-accent !px-4 !py-2 !text-sm !font-medium !text-white !border-0 !outline-none focus:!outline-none focus:!ring-0",

            cancelButton:
                "!m-0 !rounded-lg !bg-secondary hover:!bg-accent !px-4 !py-2 !text-sm !font-medium !text-primary !border !outline-none focus:!outline-none focus:!ring-0",
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