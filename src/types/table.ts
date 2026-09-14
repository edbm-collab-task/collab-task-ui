import type { ReactNode } from "react";


export type ActionType =
    | "view"
    | "edit"
    | "delete"
    | "custom";


export interface Column<T>{

    key:keyof T | string;

    header:string;

    render?:(
        value:unknown,
        row:T
    )=>ReactNode;

}



export interface TableAction<T>{

    label:string;

    type:ActionType;

    icon:ReactNode;

    roles?:string[];

    onClick:(row:T)=>void;

}



export interface HeaderAction{

    label:string;

    icon:ReactNode;

    type?:
    | "primary"
    | "secondary"
    | "danger";


    roles?:string[];

    onClick:()=>void;

}