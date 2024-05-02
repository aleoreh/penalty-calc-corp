export type KeyRatePart = {
    numerator: number
    denominator: number
}

export const getNumericValue = (keyRatePart: KeyRatePart) =>
    keyRatePart.numerator / keyRatePart.denominator

export const keyRatePartEquals = (
    value1: KeyRatePart,
    value2: KeyRatePart
): boolean => {
    return (
        value1.numerator === value2.numerator &&
        value1.denominator === value2.denominator
    )
}

export const formatKeyRatePart = (value: KeyRatePart): string =>
    `${value.numerator}/${value.denominator}`

const keyRateParts = {
    equals: keyRatePartEquals,
    format: formatKeyRatePart,
    getNumericValue,
}

export default keyRateParts
