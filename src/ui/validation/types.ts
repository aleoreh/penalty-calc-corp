import { ChangeEvent } from "react"

export type ValidationError = string | null
export type InputValueType = string | number | string[] | undefined
export type NonEmptyInputValueType = Exclude<InputValueType, undefined>

export type InputAttributes = {
    name: string
    value: InputValueType
    onChange?: (
        evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
    onBlur?: () => void
    id?: string
    "data-error"?: boolean
}

export type InputInfo = {
    attributes: InputAttributes
    label: string
    error: ValidationError
    value: InputValueType
}

export type ValidatedInput<T> = InputInfo & {
    validatedValue: T | null
}

export type FormValidation = {
    isValid: boolean
    error: ValidationError
    fieldName?: string
    label?: string
}
