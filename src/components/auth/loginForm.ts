import type { FormField } from "@/components/Form/form";
import type { UserLoginReq } from "@/types/user";


export const loginFormFields: FormField<UserLoginReq>[] = [
    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "example@gmail.com",
        validation: {
            required: "Email is required"
        }
    },

    {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "********",
        validation: {
            required: "Password is required"
        }
    }
];