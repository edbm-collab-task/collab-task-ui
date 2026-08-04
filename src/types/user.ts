import type { Gender } from "@/enum/gender.enum";
import type { RoleType } from "@/enum/role.enum";


export interface UserRequest {

    firstname: string;

    lastname: string;

    email: string;

    number: string;

    password: string;

    gender: Gender;
}



export interface UserResponse {

    id: number;

    firstname: string;

    lastname: string;

    email: string;

    number: string;

    gender: Gender;

    status: boolean;

    createdAt: string;

    role: RoleType;
}

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

