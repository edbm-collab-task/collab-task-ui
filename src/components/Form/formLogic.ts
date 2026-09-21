import type { FormField } from "@/components/Form/Forms";
import type {
    FieldValues,
    Path,
    RegisterOptions,
    UseFormGetValues,
} from "react-hook-form";

/**
 * Construit les options de validation react-hook-form pour un champ.
 * Gère en particulier la validation `matchField` (comparaison avec un autre champ,
 * ex. confirmation de mot de passe). Logique partagée par GlobalForm et GlobalEditForm.
 */
export function getRegisterOptions<T extends FieldValues>(
    field: FormField<T>,
    getValues: UseFormGetValues<T>
): RegisterOptions<T, Path<T>> {

    if (!field.matchField) {
        return field.validation ?? {};
    }

    return {
        ...(field.validation ?? {}),
        validate: (value) => {
            const matchValue = getValues(field.matchField as Path<T>);

            return value === matchValue
                ? true
                : `${String(field.label)} ne correspond pas`;
        },
    };
}