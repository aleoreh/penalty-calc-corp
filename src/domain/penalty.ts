import { KeyRatePart } from "./key-rate-part"

export type PenaltyRow = {
    id: number
    date: Date
    debtAmount: number
    ratePart: KeyRatePart
    rate: number
    doesMoratiriumActs: boolean
    doesDefermentActs: boolean
    penaltyAmount: number
}

export type Penalty = {
    period: Date
    rows: PenaltyRow[]
}
