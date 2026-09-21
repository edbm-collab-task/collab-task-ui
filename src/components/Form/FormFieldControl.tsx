import type { FormField } from "@/components/Form/Forms";
import {
    Eye,
    EyeOff,
} from "lucide-react";
import type {
    FieldValues,
    FieldError,
    UseFormRegisterReturn,
} from "react-hook-form";

interface FormFieldControlProps<T extends FieldValues> {
    field: FormField<T>;
    fieldProps: UseFormRegisterReturn;
    error?: FieldError;
    loading: boolean;
    showPassword: boolean;
    onTogglePassword: () => void;
    inputClass: string;
    textareaClass: string;
    labelClass: string;
    descriptionClass: string;
    passwordButtonClass: string;
}

/**
 * Rendu commun d'un champ de formulaire (label, contrôle, description, erreur).
 * Utilisé par GlobalForm et GlobalEditForm. Ne contient aucune logique
 * métier (validation, submit, reset) — uniquement le rendu.
 */
export default function FormFieldControl<T extends FieldValues>({
    field,
    fieldProps,
    error,
    loading,
    showPassword,
    onTogglePassword,
    inputClass,
    textareaClass,
    labelClass,
    descriptionClass,
    passwordButtonClass,
}: FormFieldControlProps<T>) {

    const isEmail = field.type === "email";

    return (
        <div className="space-y-2">

            <label className={labelClass}>
                {field.label}
            </label>

            {field.type === "select" ? (

                <select
                    {...fieldProps}
                    disabled={field.disabled || loading}
                    className={inputClass}
                >

                    <option value="">
                        Select...
                    </option>

                    {field.options?.map((option) => (
                        <option
                            key={String(option.value)}
                            value={String(option.value)}
                        >
                            {option.label}
                        </option>
                    ))}

                </select>

            ) : field.type === "textarea" ? (

                <textarea
                    rows={5}
                    {...fieldProps}
                    placeholder={field.placeholder}
                    disabled={field.disabled || loading}
                    className={textareaClass}
                />

            ) : field.type === "checkbox" ? (

                <div className="flex items-center gap-3">

                    <input
                        type="checkbox"
                        {...fieldProps}
                        disabled={field.disabled || loading}
                        className="h-5 w-5 rounded border-gray-300"
                    />

                    {field.description && (
                        <span className="text-sm text-gray-600">
                            {field.description}
                        </span>
                    )}

                </div>

            ) : (

                <div className="relative">

                    <input
                        type={
                            field.type === "password" && showPassword
                                ? "text"
                                : field.type
                        }
                        {...fieldProps}
                        onChange={(e) => {
                            if (isEmail) {
                                e.target.value = e.target.value.toLowerCase();
                            }
                            fieldProps.onChange(e);
                        }}
                        placeholder={field.placeholder}
                        disabled={field.disabled || loading}
                        className={`${inputClass} ${field.type === "password" ? "pr-12" : ""}`}
                    />

                    {field.type === "password" && (

                        <button
                            type="button"
                            disabled={loading}
                            onClick={onTogglePassword}
                            className={passwordButtonClass}
                        >

                            {showPassword
                                ? <EyeOff size={20} />
                                : <Eye size={20} />
                            }

                        </button>

                    )}

                </div>

            )}

            {field.description && field.type !== "checkbox" && (
                <p className={descriptionClass}>
                    {field.description}
                </p>
            )}

            {error && (
                <p className="text-sm font-medium text-red-500">
                    {String(error?.message)}
                </p>
            )}

        </div>
    );
}