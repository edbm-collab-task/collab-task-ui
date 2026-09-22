import type { FormField } from "@/components/Form/Forms";
import type { DirectionRes } from "@/types/direction";
import type { CreateUser } from "@/types/user";
import { toDirectionOptions } from "@/mappers/direction.mapper";

export const createUserFormFields = (
    directions: DirectionRes[],
    roles: { label: string; value: string }[] = []
): FormField<CreateUser>[] => [
    {
        name: "firstname",
        label: "Nom",
        type: "text",
        placeholder: "Entrer votre nom...",
        validation: {
            required: "Nom est requis",
            pattern: {
                value: /^\D+$/,
                message: "Le nom ne doit pas contenir de chiffres"
            }
        },
    },

    {
        name: "lastname",
        label: "Prénom",
        type: "text",
        placeholder: "Entrer votre prénom...",
        validation: {
            required: "Prénom est requis",
            pattern: {
                value: /^\D+$/,
                message: "Le prénom ne doit pas contenir de chiffres"
            }
        },
    },

    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "example@gmail.com",
        validation: {
            required: "Email est requis",
        },
    },

    {
        name: "directionId",
        label: "Direction",
        type: "select",
        placeholder: "Choisir la direction...",
        options: toDirectionOptions(directions),
        validation: {
            required: "La direction est requise",
        },
    },

    ...(roles.length > 0
        ? [
              {
                  name: "role" as const,
                  label: "Rôle",
                  type: "select" as const,
                  placeholder: "Choisir le rôle...",
                  options: roles,
                  validation: {
                      required: "Le rôle est requis",
                  },
              },
          ]
        : []),
];