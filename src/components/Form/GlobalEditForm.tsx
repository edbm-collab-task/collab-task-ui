import { useEffect, useState } from "react";
import {
    useForm,
    type DefaultValues,
    type FieldValues,
    type FieldError,
} from "react-hook-form";
import { getRegisterOptions } from "@/components/Form/formLogic";
import FormFieldControl from "@/components/Form/FormFieldControl";
import type { FormField } from "@/components/Form/Forms";

interface GlobalEditFormProps<T extends FieldValues> {
    title?: string;
    subtitle?: string;
    fields: FormField<T>[];
    initialValues: T;
    onSubmit: (data: T) => void | Promise<void>;
    submitLabel?: string;
}

export default function GlobalEditForm<T extends FieldValues>({
    title = "Modifier",
    subtitle,
    fields,
    initialValues,
    onSubmit,
    submitLabel = "Modifier",
}: GlobalEditFormProps<T>) {

    const {
        register,
        handleSubmit,
        getValues,
        reset,
        formState: { errors },
    } = useForm<T>({
        defaultValues: initialValues as DefaultValues<T>,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100";

    const textareaClass =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none resize-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100";

    const isTwoColumns = fields.length > 4;

    useEffect(() => {
        reset(initialValues as DefaultValues<T>);
    }, [initialValues, reset]);

    const submitForm = async (data: T): Promise<void> => {

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

                <div className="bg-gradient-to-r py-8 text-center">

                    <h2 className="text-3xl font-bold text-black/80">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="pt-2 text-black">
                            {subtitle}
                        </p>
                    )}

                </div>

                <form
                    onSubmit={handleSubmit(
                        (data) => submitForm(data as T)
                    )}
                    className="p-8"
                >

                    <div
                        className={`grid gap-6 ${
                            isTwoColumns
                                ? "grid-cols-1 md:grid-cols-2"
                                : "grid-cols-1"
                        }`}
                    >

                        {fields.map((field) => {

                            const fieldProps = register(
                                field.name,
                                getRegisterOptions(field, getValues)
                            );

                            return (
                                <FormFieldControl
                                    key={String(field.name)}
                                    field={field}
                                    fieldProps={fieldProps}
                                    error={errors[field.name] as FieldError | undefined}
                                    loading={loading}
                                    showPassword={showPassword}
                                    onTogglePassword={() =>
                                        setShowPassword(
                                            (previous) => !previous
                                        )
                                    }
                                    inputClass={inputClass}
                                    textareaClass={textareaClass}
                                    labelClass="text-sm font-semibold text-gray-700"
                                    descriptionClass="text-xs text-gray-500"
                                    passwordButtonClass="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-blue-600"
                                />
                            );
                        })}

                        <div
                            className={`flex items-end justify-center ${
                                isTwoColumns &&
                                fields.length % 2 === 0
                                    ? "md:col-span-2"
                                    : ""
                            }`}
                        >

                            <button
                                type="submit"
                                disabled={loading}
                                className="min-w-44 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                            >

                                {loading
                                    ? `${submitLabel}...`
                                    : submitLabel}

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>
    );
}