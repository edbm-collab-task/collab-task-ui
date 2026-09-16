import type { FormField } from "@/components/Form/Forms";
import type { Email } from "@/types/email";

export const userEmailFormFields: FormField<Email>[] = [
     {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "exemple@gmail.com",
        validation: {
            required: "Email is required"
        }
    }
];