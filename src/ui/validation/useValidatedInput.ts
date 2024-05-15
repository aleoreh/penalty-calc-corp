import { Decoder } from "decoders"
import { useState } from "react"

import {
    NonEmptyInputValueType,
    ValidatedInput,
    InputAttributes,
    ValidationError,
} from "./types"

const useValidatedInput = <V extends NonEmptyInputValueType, T>(
    id: string,
    name: string,
    label: string,
    decoder: Decoder<T>,
    initialValue: V
): ValidatedInput<T> => {
    const [value, setValue] =
        useState<InputAttributes["value"]>(initialValue)
    const [error, setError] = useState<ValidationError>(null)
    const [validatedValue, setValidatedValue] = useState<T | null>(
        decoder.value(initialValue) || null
    )

    const onChange: InputAttributes["onChange"] = (evt) => {
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
        attributes: { id, name, value, onChange, "data-error": error !== null },
        label,
        error,
        value,
        validatedValue,
    }
}

export default useValidatedInput
