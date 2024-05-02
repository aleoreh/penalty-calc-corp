import { Payment } from "./payment"

export type Debt = {
    period: Date
    amount: number
    dueDate: Date
    payments: Payment[]
}
