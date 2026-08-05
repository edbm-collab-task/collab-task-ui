import { useForm, type FieldValues } from "react-hook-form";
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

export default function GlobalForm<T extends FieldValues>({
    title = "Formulaire",
    subtitle,
    fields,
    onSubmit,
    submitLabel = "Enregistrer",
}: Props<T>) {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<T>();

    const values = watch();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100";

    const textareaClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none resize-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100";


    const isTwoColumns = fields.length > 4;


    const getRegisterOptions = (field: FormField<T>) => ({
        ...field.validation,
        ...(field.matchField && {
            validate: (value: unknown) =>
                value === values[field.matchField] ||
                `${field.label} does not match`
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

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">

                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">

                    <h2 className="text-3xl font-bold text-white">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="mt-2 text-sm text-blue-100">
                            {subtitle}
                        </p>
                    )}

                </div>


                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="p-8"
                >

                    <div className={`grid gap-6 ${isTwoColumns ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>

                        {fields.map((field) => (

                            <div
                                key={String(field.name)}
                                className="space-y-2"
                            >

                                <label className="text-sm font-semibold text-gray-700">
                                    {field.label}
                                </label>


                                {field.type === "select" ? (

                                    <select
                                        {...register(field.name, getRegisterOptions(field))}
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
                                        {...register(field.name, getRegisterOptions(field))}
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
                                            {...register(field.name, getRegisterOptions(field))}
                                            placeholder={field.placeholder}
                                            disabled={field.disabled || loading}
                                            className={`${inputClass} ${field.type === "password" ? "pr-12" : ""}`}
                                        />


                                        {field.type === "password" && (

                                            <button
                                                type="button"
                                                disabled={loading}
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-blue-600"
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
                                    <p className="text-xs text-gray-500">
                                        {field.description}
                                    </p>
                                )}


                                {errors[field.name] && (
                                    <p className="text-sm font-medium text-red-500">
                                        {String(errors[field.name]?.message)}
                                    </p>
                                )}

                            </div>

                        ))}


                        <div className={`flex items-end justify-center ${isTwoColumns && fields.length % 2 === 0 ? "md:col-span-2" : ""}`}>

                            <button
                                type="submit"
                                disabled={loading}
                                className="min-w-44 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
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