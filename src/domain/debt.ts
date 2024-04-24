import { Payment } from "./payment"

export type Debt = {
    period: Date
    amount: number
    payments: Payment[]
}
