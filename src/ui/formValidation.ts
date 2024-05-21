import { DecodeResult, Decoder } from "decoders"
import {
    ChangeEvent,
    HTMLInputTypeAttribute,
    useCallback,
    useMemo,
    useState,
} from "react"

type ValidationError = string | null

export type FormValidation = {
    isValid: boolean
    error: ValidationError
    fieldName?: string
    label?: string
}

type Attributes = {
    type: Extract<HTMLInputTypeAttribute, "text" | "date" | "month">
    name: string
    onChange?: (
        evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
    onBlur?: () => void
    id?: string
}

type ValidatedInputMeta = {
    attributes: Attributes & { "data-error": boolean }
    label: string
    error: ValidationError
    value: string
    reset: () => void
}

type ValidatedInput<T> = ValidatedInputMeta & {
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
    attributes: Pick<Attributes, "id" | "name" | "type">
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
        reset: () => {
            setValue(initValue)
        },
    }
}

type ValidatedForm = {
    validatedInputs: ValidatedInputMeta[]
    validation: FormValidation
    submit: () => void
    reset: () => void
    onClose: () => void
    onReset?: () => void
}

export const useValidatedForm = (
    validatedInputs: ValidatedInputMeta[],
    submit: () => void,
    onClose: () => void,
    onReset?: () => void
): ValidatedForm => {
    const getResult = useCallback(
        (): FormValidation => toFormValidation(validatedInputs),
        [validatedInputs]
    )

    const reset = () => {
        onReset?.()
        validatedInputs.forEach((validatedInput) => validatedInput.reset())
    }

    const resetWithClose = () => {
        reset()
        onClose()
    }

    return {
        validatedInputs,
        validation: getResult(),
        submit,
        reset,
        onClose: resetWithClose,
    }
}

