import { useForm, type FieldValues, type FieldError } from "react-hook-form";
import type { FormField } from "@/components/Form/Forms";
import { useState } from "react";
import { getRegisterOptions } from "@/components/Form/formLogic";
import FormFieldControl from "@/components/Form/FormFieldControl";

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
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                    inputClass={inputClass}
                                    textareaClass={textareaClass}
                                    labelClass="text-sm font-medium text-primary/80"
                                    descriptionClass="text-xs text-primary/50"
                                    passwordButtonClass="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg text-primary/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                />
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