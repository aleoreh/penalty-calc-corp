export type KeyRatePart = {
    numerator: number
    denominator: number
}

const getNumericValue = (keyRatePart: KeyRatePart) =>
    keyRatePart.numerator / keyRatePart.denominator

const equals = (value1: KeyRatePart, value2: KeyRatePart): boolean => {
    return (
        value1.numerator === value2.numerator &&
        value1.denominator === value2.denominator
    )
}

const format = (value: KeyRatePart): string =>
    `${value.numerator}/${value.denominator}`

const keyRateParts = {
    equals,
    format,
    getNumericValue,
}

export default keyRateParts
