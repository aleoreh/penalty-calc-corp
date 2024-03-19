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
