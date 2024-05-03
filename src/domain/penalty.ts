import { KeyRatePart } from "./keyrate-part"

export type PenaltyRow = {
    id: number
    date: Date
    debtAmount: Kopek
    ratePart: KeyRatePart
    rate: number
    doesMoratoriumActs: boolean
    doesDefermentActs: boolean
    penaltyAmount: Kopek
}

export type Penalty = {
    period: Date
    rows: PenaltyRow[]
}

export const getTotalPenaltyAmount = (value: Penalty): Kopek =>
    value.rows.reduce((acc, x) => acc + x.penaltyAmount, 0) as Kopek

export const penaltyFilter =
    (predicate: (value: PenaltyRow, index: number) => boolean) =>
    (value: Penalty): Penalty => ({
        ...value,
        rows: value.rows.filter(predicate),
    })

const penalties = {
    filter: penaltyFilter,
    getTotalAmount: getTotalPenaltyAmount,
}

export default penalties
