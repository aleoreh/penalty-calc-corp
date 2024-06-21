import { Kopek2 } from "../../lib/kopek2"
import { BillingPeriod } from "../../lib/period"
import { KeyRatePart } from "./key-rate-part"
import { KeyRate } from "./types"

export type Penalty = {
    period: BillingPeriod
    items: PenaltyItem[]
}

export type PenaltyItem = {
    date: Date
    debtAmount: Kopek2
    ratePart: KeyRatePart
    rate: KeyRate
    doesMoratoriumActs: boolean
    doesDefermentActs: boolean
    penaltyAmount: Kopek2
}
