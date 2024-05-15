import { useCallback } from "react"

import { FormValidation, InputInfo } from "./types"

const toFormValidation = (validatedInputs: InputInfo[]) => {
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

const useFormValidation = (
    validatedInputs: InputInfo[]
): FormValidation => {
    const getResult = useCallback(
        (): FormValidation => toFormValidation(validatedInputs),
        [validatedInputs]
    )

    return getResult()
}

export default useFormValidation

