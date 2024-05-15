import { DecodeResult, Decoder } from "decoders"
import { ChangeEvent, useCallback, useMemo, useState } from "react"

type ValidationError = string | null

export type FormValidation = {
    isValid: boolean
    error: ValidationError
    fieldName?: string
    label?: string
}

type Attributes = {
    name: string
    onChange?: (
        evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
    onBlur?: () => void
    id?: string
    "data-error": boolean
}

type ValidatedInputMeta = {
    attributes: Attributes
    label: string
    error: ValidationError
}

type ValidatedInput<T> = ValidatedInputMeta & {
    value: string
    validatedValue: DecodeResult<T>
}

const toFormValidation = (
    validatedInputs: ValidatedInputMeta[]
): FormValidation => {
    for (let validatedInput of validatedInputs) {
        if (validatedInput.error !== null)
            return {
                fieldName: validatedInput.attributes.name,
                label: validatedInput.label,
                error: validatedInput.error,
                isValid: false,
            }
    }

    return {
        error: null,
        isValid: true,
    }
}

export const useValidatedInput = <T>(
    initValue: string,
    label: string,
    decoder: Decoder<T>,
    attributes: Pick<Attributes, "id" | "name">
): ValidatedInput<T> => {
    const [value, setValue] = useState(initValue)

    const decoded = useMemo(() => decoder.decode(value), [decoder, value])

    const onChange: Attributes["onChange"] = (evt) => {
        setValue(evt.target.value)
    }

    return {
        attributes: {
            ...attributes,
            get "data-error"() {
                return !decoded.ok
            },
            onChange,
        },
        label,
        error: decoded.error
            ? decoded.error.text || "Неправильное значение"
            : null,
        get validatedValue() {
            return decoded
        },
        get value() {
            return value
        },
        set value(x) {
            setValue(x)
        },
    }
}

export const useFormValidation = (
    validatedInputs: ValidatedInputMeta[]
): FormValidation => {
    const getResult = useCallback(
        (): FormValidation => toFormValidation(validatedInputs),
        [validatedInputs]
    )

    return getResult()
}
