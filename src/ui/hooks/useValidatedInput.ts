import { Decoder } from "decoders"
import { ChangeEvent, useState } from "react"

type InputValueType = string | number | string[] | undefined

type ValidatedInputAttributes = {
    name: string
    value: InputValueType
    onChange?: (
        evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
    onBlur?: () => void
    id?: string
}

type ValidationError = string | null

type ValidatedInput<T> = {
    attibutes: ValidatedInputAttributes
    error: ValidationError
    validatedValue: T | null
}

const useValidatedInput = <T>(
    name: string,
    decoder: Decoder<T>,
    initialValue: InputValueType
): ValidatedInput<T> => {
    const [value, setValue] =
        useState<ValidatedInputAttributes["value"]>(undefined)
    const [error, setError] = useState<ValidationError>(null)
    const [validatedValue, setValidatedValue] = useState<T | null>(
        decoder.value(initialValue) || null
    )

    const onChange: ValidatedInputAttributes["onChange"] = (evt) => {
        const targetValue = evt.target.value
        setValue(targetValue)
        const res = decoder.decode(targetValue)
        if (res.ok) {
            setValidatedValue(res.value)
            setError(null)
        } else {
            setValidatedValue(null)
            setError(
                res.error.text ||
                    `Не удалось прочитать значение ${targetValue}! Попробуйте ввести другое`
            )
        }
    }

    return {
        attibutes: { name, value, onChange },
        error,
        validatedValue,
    }
}

export default useValidatedInput
