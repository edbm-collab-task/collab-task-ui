import type {UserTable,UserResponse} from "@/types/user";

export function toUserTable(user: UserResponse): UserTable {
    return {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
    };
}