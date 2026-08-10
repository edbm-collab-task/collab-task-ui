import type { FormField } from "@/components/form/Forms";
import type { DirectionReq } from "@/types/direction";

export const directionFormField:FormField<DirectionReq>[] = [

     {
        name: "name",
        label: "Nom de la Direction",
        type: "text",
        placeholder: "Entrer ici le nom...",

        validation: {
            required: "Direction est requis",

            minLength: {
                value: 2,
                message: "Direction doit contenir au moins 2 caractères"
            },

            maxLength: {
                value: 50,
                message: "Direcation doit contenir au maximum 50 caractères"
            }
        }
    },
]