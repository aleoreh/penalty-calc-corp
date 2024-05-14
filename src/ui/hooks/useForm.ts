import { FormEventHandler, useState } from "react"

type UseFormParams<T> = {
    fields: Array<{ error: string; hasError: () => boolean }>
    submit: () => Promise<T>
    onSuccess?: (submitAnswer: T) => void
    onFailure?: (error: string) => void
}

const useForm = <T>({
    fields,
    submit,
    onSuccess,
    onFailure,
}: UseFormParams<T>) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSendingError, setIsSendingError] = useState("")

    const handleFormSubmit: FormEventHandler<HTMLFormElement> = async (evt) => {
        evt.preventDefault()

        const errors = await Promise.all(
            fields.map((field) => field.hasError())
        )
        const isFormValid = errors.every((error) => !error)

        if (isFormValid) {
            setIsSubmitting(true)
            setIsSendingError("")

            try {
                const answer = await submit()
                onSuccess?.(answer)
            } catch (err) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Во время выполнения операции произошла ошибка. Попробуйте ещё раз позже"

                setIsSendingError(msg)
                onFailure?.(msg)
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const hasFieldErrors = fields.some((field) => !!field.error)

    return {
        isSubmitting,
        isSendingError,
        hasFieldErrors,
        handleFormSubmit,
    }
}

export default useForm
