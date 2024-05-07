import { getDefaultDueDate } from "../domain/calculator"

export type GetDueDate = (debtPeriod: Date, daysToPay: number) => Promise<Date>

export const getDueDate: GetDueDate = async (debtPeriod, daysToPay) =>
    getDefaultDueDate(debtPeriod, daysToPay)
