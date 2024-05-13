export type Percent = number & { __brand: Percent }

export const numberToPercent = (value: number): Percent =>
    (value * 100) as Percent

export const percentToNumber = (value: Percent): number => value / 100
