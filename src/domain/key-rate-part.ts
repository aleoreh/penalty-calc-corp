export type KeyRatePart = {
    numerator: number
    denominator: number
}

const getNumericValue = (keyRatePart: KeyRatePart) =>
    keyRatePart.numerator / keyRatePart.denominator

const keyRatePart = {
    getNumericValue,
}

export default keyRatePart
