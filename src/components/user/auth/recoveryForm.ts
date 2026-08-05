import type { FormField } from "@/components/form/Forms";
import type { RecoverPasswordFormUI } from "@/types/user";


export const recoveryFormFields: FormField<RecoverPasswordFormUI>[] = [
    {
        name: "password",
        label: "Nouveau mot de passe",
        type: "password",
        placeholder: "********",
        validation: {
            required: "Nouveau mot de passe est requis"
        }
    },
    {
        name: "confirmPassword",
        label: "Confirmer le mot de passe",
        type: "password",
        placeholder: "********",
        validation: {
            required: "Confirmer le mot de passe est requis"
        }
    }
];