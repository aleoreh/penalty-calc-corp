export type ValidationResult = string | null

export type Validator<T> = (value?: T) => Promise<ValidationResult>

export type DescribeValidator<O, T> = (options?: O) => Validator<T>

export const validate = async <T>(
    value: T,
    validators: Validator<T>[]
): Promise<ValidationResult> => {
    let res: ValidationResult = null

    for (let i = 0; i < validators.length; i++) {
        const validation = await validators[i](value)

        if (validation !== null) {
            res = validation
            break
        }
    }

    return res
}
