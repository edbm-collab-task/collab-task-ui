import type {
    FieldValues,
    Path,
    RegisterOptions
} from "react-hook-form";


export type FieldType =
    | "text"
    | "email"
    | "password"
    | "select"
    | "date"
    | "datetime"
    | "number"
    | "boolean"
    | "file"
    | "textarea"
    | "checkbox"
    | "radio";



export interface SelectOption {

    label: string;

    value: string | number;

}



export interface FileConfig {

    accept?: string[];

    multiple?: boolean;

    maxSize?: number;

    maxFiles?: number;

}



export interface DateConfig {

    format:
        | "LOCAL_DATE"
        | "LOCAL_DATE_TIME";

}



export interface FormField<
    T extends FieldValues = FieldValues
> {

    name: Path<T>;

    label: string;

    type: FieldType;


    placeholder?: string;

    showPassword?: boolean;


    /**
     * Validation react-hook-form
     */
    validation?: RegisterOptions<T, Path<T>>;

    matchField?: Path<T>;

    options?: SelectOption[];


    file?: FileConfig;


    date?: DateConfig;


    disabled?: boolean;


    description?: string;


    defaultValue?: unknown;


    metadata?: Record<string, unknown>;

}