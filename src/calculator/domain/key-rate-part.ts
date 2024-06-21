export type KeyRatePart = {
    numerator: number
    denominator: number
}
export function createKeyRatePart(
    numerator: number,
    denominator: number
): KeyRatePart {
    return {
        numerator,
        denominator,
    }
}

export function keyRatePartValue({
    numerator,
    denominator,
}: KeyRatePart): number {
    return numerator / denominator
}

export function formatKeyRatePart(value: KeyRatePart): string {
    return `${value.numerator}/${value.denominator}`
}

export function keyRatePartEquals(x: KeyRatePart, y: KeyRatePart): boolean {
    return x.numerator === y.numerator && x.denominator === y.denominator
}

export const keyRateParts = {
    create: createKeyRatePart,
    value: keyRatePartValue,
    format: formatKeyRatePart,
    equals: keyRatePartEquals,
}

export default keyRateParts

