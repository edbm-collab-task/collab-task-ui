import { useForm, type FieldValues, type Path } from "react-hook-form";
import type { FormField } from "@/components/Form/Forms";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props<T extends FieldValues> {
    title?: string;
    subtitle?: string;
    fields: FormField<T>[];
    onSubmit: (data: T) => void | Promise<void>;
    submitLabel?: string;
}

export default function GlobalForms<T extends FieldValues>({
    title = "Formulaire",
    subtitle,
    fields,
    onSubmit,
    submitLabel = "Enregistrer",
}: Props<T>) {

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm<T>();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    const inputClass = "w-full rounded-xl border border-secondary/60 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary/20 disabled:opacity-60";

    const textareaClass = "w-full rounded-xl border border-secondary/60 bg-white px-4 py-3 outline-none resize-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-secondary/20 disabled:opacity-60";


    const isTwoColumns = fields.length > 4;


    const getRegisterOptions = (field: FormField<T>) => ({
        ...field.validation,
        ...(field.matchField && {
            validate: (value: unknown) => {
                const matchValue = getValues(field.matchField as Path<T>);
                return value === matchValue ||
                    `${String(field.label)} ne correspond pas`;
            }
        })
    });


    const submitHandler = async (data: T) => {

        try {

            setLoading(true);

            await onSubmit(data);

        } finally {

            setLoading(false);

        }

    };


    return (
        <div className="mx-auto max-w-5xl">

            <div className="overflow-hidden rounded-2xl border border-secondary/60 bg-white shadow-sm">

                <div className="border-b border-secondary/60 bg-secondary/30 py-8 text-center">

                    <h2 className="text-3xl font-bold text-primary">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="pt-2 text-primary/70">
                            {subtitle}
                        </p>
                    )}

                </div>


                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="p-6 sm:p-8"
                >

                    <div className={`grid gap-6 ${isTwoColumns ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>

                        {fields.map((field) => {

                            const fieldProps = register(
                                field.name,
                                getRegisterOptions(field)
                            );

                            const isEmail = field.type === "email";

                            return (
                            <div
                                key={String(field.name)}
                                className="space-y-2"
                            >

                                <label className="text-sm font-medium text-primary/80">
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


                                        {field.options?.map(option => (
                                            <option
                                                key={option.value}
                                                value={option.value}
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
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg text-primary/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                            >

                                                {showPassword
                                                    ? <EyeOff size={20}/>
                                                    : <Eye size={20}/>
                                                }

                                            </button>

                                        )}

                                    </div>

                                )}


                                {field.description && (
                                    <p className="text-xs text-primary/50">
                                        {field.description}
                                    </p>
                                )}


                                {errors[field.name] && (
                                    <p className="text-sm font-medium text-red-500">
                                        {String(errors[field.name]?.message)}
                                    </p>
                                )}

                            </div>
                            );
                        })}


                        <div className={`flex items-end justify-center ${isTwoColumns && fields.length % 2 === 0 ? "md:col-span-2" : ""}`}>

                            <button
                                type="submit"
                                disabled={loading}
                                className="min-w-44 rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-sm transition duration-300 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
                            >

                                {loading ? `${submitLabel}...` : submitLabel}

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    );
}