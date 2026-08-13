import type { Gender } from "@/enum/gender.enum";
import type { RoleType } from "@/enum/role.enum";


export interface UserRequest {

    firstname: string;

    lastname: string;

    email: string;

    number: string;

    job : string ; 

    directionId : number ;

    password: string;

    gender: Gender;
}

export interface CreateUser{
    firstname: string;

    lastname: string;

    email: string;

    directionId : number ;
}



export interface UserResponse {

    id: number;

    firstname: string;

    lastname: string;

    email: string;

    number: string;

    gender: Gender;

    direction: string;

    job: string;
    
    isActive: boolean;

    status: boolean;

    createdAt: string;
    
    imagePath: string;

    role: RoleType;
}

export interface UserTable {

    id: number;

    firstname: string;

    lastname: string;

    email: string;

    role: RoleType;
}

export interface UserDetails {
    firstname: string;

    lastname: string;

    email: string;

    number: string;

    gender: Gender;

    direction: string;

    job: string;

    status: boolean;

    isActive: boolean;

    createdAt: string;

    role: RoleType;
}


export const userTr = {

    firstname: "Prénom",

    lastname: "Nom",

    email: "Email",

    role: "Rôle",

} as const;

export interface UserLoginReq{
    email: string ;
    password: string;
}

export interface UserLoginRes {
  role: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface RegisterForm extends UserRequest {
    confirmPassword: string;
}

export interface RecoverPasswordForm {
    email: string;
    password: string;
}

export interface RecoverPasswordFormUI {
    password: string;
    confirmPassword: string;
}

export interface RecoveryMeResponse {
    email: string;
    recovery: boolean;
}

export interface UserProfile {
    id: number;

    firstname: string;
    lastname: string;
    email: string;
    number: string;

    gender: Gender;

    direction: string;
    job: string;

    imagePath: string;

    status: boolean;
    isActive: boolean;

    createdAt: string;

    role: RoleType;
}

export interface EditUser {
    firstname: string;
    lastname: string;
    job: string;
    email: string;
    number: string;
    gender: Gender;
    directionId?: number;
}