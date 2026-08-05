import type { FormField } from "@/components/Form/Forms";
import type { UserLoginReq } from "@/types/user";


export const loginFormFields: FormField<UserLoginReq>[] = [
    {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "exemple@gmail.com",
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