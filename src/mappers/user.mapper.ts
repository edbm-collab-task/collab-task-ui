import type {UserTable,UserResponse} from "@/types/user";

export function toUserTable(user: UserResponse): UserTable {
    return {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        number: user.number,
        gender: user.gender === "M" ? "Homme" : "Femme",
        status: user.status === true ? "Actif" : "Inactif",
        createdAt: user.createdAt,
        role: user.role
    };
}