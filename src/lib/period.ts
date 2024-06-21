import Opaque, { create, widen } from "ts-opaque"
import days, { beginOfPeriod } from "./days"

export type BillingPeriod = Opaque<Date, "BillingPeriod">

export const billingPeriodFromDate = (
    anyDateWithinPeriod: Date
): BillingPeriod => create(beginOfPeriod(anyDateWithinPeriod, "month"))

export const periodsEqual = (
    period1: BillingPeriod,
    period2: BillingPeriod
): boolean =>
    days.beginOfPeriod(widen(period1), "month") ===
    days.beginOfPeriod(widen(period2), "month")

export const periods = {
    fromDate: billingPeriodFromDate,
    equal: periodsEqual,
}

export default periods

