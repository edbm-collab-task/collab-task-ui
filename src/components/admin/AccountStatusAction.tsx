import type { TableAction } from "@/types/table";
import { confirmDelete } from "@/components/modal/confirmDelete";
import { userService } from "@/services/user/user.service";

interface AccountStatusActionProps<S = string> {
    label?: string | ((statusFilter: S) => string);
    roles?: string[];
    statusFilter: S;
    onReload: (statusFilter: S) => Promise<void>;
}

export function createAccountStatusAction<T extends { email: string; isActive: boolean }, S = string>(
    props: AccountStatusActionProps<S>
): TableAction<T> {
    const { label, roles = ["SUPER_ADMIN"], statusFilter, onReload } = props;

    const resolvedLabel = typeof label === "function" ? label(statusFilter) : (label ?? "Activer / Désactiver");

    return {
        label: resolvedLabel,
        type: "delete",
        icon: (item: T) => (
            <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${item.isActive ? "bg-primary" : "bg-gray-400"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${item.isActive ? "right-0.5" : "left-0.5"}`} />
            </div>
        ),
        roles,
        onClick: async (item: T) => {
            const newStatus = !item.isActive;

            const confirmed = await confirmDelete(
                newStatus ? "activer ce compte" : "desactiver ce compte"
            );

            if (!confirmed) {
                return;
            }

            try {
                await userService.updateAccountStatus(item.email, newStatus);
                await onReload(statusFilter);
            } catch (error) {
                console.error(
                    newStatus ? "Erreur lors de l'activation :" : "Erreur lors de la désactivation :",
                    error
                );
            }
        },
    };
}