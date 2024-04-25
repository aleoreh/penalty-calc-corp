import { KeyRatePart } from "./keyrate-part"

export type PenaltyRow = {
    id: number
    date: Date
    debtAmount: number
    ratePart: KeyRatePart
    rate: number
    doesMoratoriumActs: boolean
    doesDefermentActs: boolean
    penaltyAmount: number
}

export type Penalty = {
    period: Date
    rows: PenaltyRow[]
}

const getTotalPenaltyAmount = (value: Penalty): number =>
    value.rows.reduce((acc, x) => acc + x.penaltyAmount, 0)

const filter =
    (predicate: (value: PenaltyRow, index: number) => boolean) =>
    (value: Penalty): Penalty => ({
        ...value,
        rows: value.rows.filter(predicate),
    })

const penalties = {
    filter,
    getTotalPenaltyAmount,
}

export default penalties
