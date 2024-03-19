import { Dayjs } from "dayjs"

export type Debt = {
    period: Dayjs
    sum: number
}

export type Payment = {
    date: Dayjs
    period: Dayjs
    sum: number
}

export function debtFromNullable({
    period,
    sum,
}: {
    period: Dayjs | null | undefined
    sum: number | null | undefined
}): Debt | undefined {
    return !!period && !!sum ? { period, sum } : undefined
}
