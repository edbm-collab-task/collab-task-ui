import type {
    RecoverPasswordForm,
    RecoverPasswordFormUI
} from "@/types/user";

export function toRecoverPasswordRequest(
    email: string,
    form: RecoverPasswordFormUI
): RecoverPasswordForm {

    return {
        email,
        password: form.password
    };
}