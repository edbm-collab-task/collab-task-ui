import type { FormField } from "@/components/Form/Forms";
import type { CodeVerification } from "@/types/codeVerification";

export const codeVerificationFormFields: FormField<CodeVerification>[] = [
    {
        name: "code",
        label: "Code de vérification",
        type: "number",
        placeholder: "123456",
        validation: {
            required: "Le code est obligatoire",
            pattern: {
                value: /^[0-9]{6}$/,
                message: "Le code doit contenir exactement 6 chiffres"
            }
        },
        description: "Entrez le code à 6 chiffres reçu par e-mail."
    }
];