import { ChangeEvent, useCallback, useState } from "react"

import { DefaultField } from "./types"
import { ValidationResult, Validator, validate } from "../validation"

type TextField = DefaultField & {
    handleInput: (
        evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void
    handleBlur: () => void
}

const useTextFormField = (
    id: string,
    validators: Validator<string>[],
    init = ""
) => {
    const [value, setValue] = useState(init)
    const [error, setError] = useState<ValidationResult>(null)

    const handleChange = useCallback(
        async (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const targetValue = evt.target.value

            setValue(targetValue)
            setError(await validate(targetValue, validators))
        },
        [validators]
    )

    const handleBlur = useCallback(async () => {
        setError(await validate(value, validators))
    }, [validators, value])

    const hasError = useCallback(async () => {
        const err = await validate(value, validators)
        setError(err)

        return !!err
    }, [validators, value])

    return {
        id,
        value,
        error,
        handleChange,
        handleBlur,
        hasError,
    }
}

export { type TextField }
export default useTextFormField
