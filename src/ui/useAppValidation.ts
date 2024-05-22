import { TextFieldProps } from "@mui/material"
import { Decoder, always } from "decoders"
import { ChangeEvent, useMemo, useState } from "react"

type AppValidationHookResult<T> = {
    muiProps: Pick<TextFieldProps, "error" | "helperText" | "onChange">
    value: T
    error: string | null
}

/**
 * Use example:
 * ```
 * const field = useAppValidation(...)
 * const Component = <TextField {...field.muiProps} />
 * ```
 */
export const useAppValidation = <T>(
    decoder: Decoder<T>,
    defaultOutput: T
): AppValidationHookResult<T> => {
    const defaultError = "Ошибка чтения значения"

    const [innerValue, setInnerValue] = useState(
        always(defaultOutput).decode(null)
    )

    const onChange = useMemo(
        () => (input: string) => {
            setInnerValue(decoder.decode(input))
        },
        [decoder]
    )

    return {
        muiProps: {
            error: !innerValue.ok,
            helperText: innerValue.error?.text || defaultError,
            onChange: (
                evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => onChange(evt.target.value),
        },
        value: innerValue.value || defaultOutput,
        error: innerValue.ok ? null : innerValue.error.text || defaultError,
    }
}
