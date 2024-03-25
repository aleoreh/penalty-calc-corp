import { Dayjs } from "dayjs"

export type Debt = {
    period: Dayjs
    dueDate: Dayjs
    sum: number
}

export type Payment = {
    period: Dayjs
    date: Dayjs
    sum: number
}
