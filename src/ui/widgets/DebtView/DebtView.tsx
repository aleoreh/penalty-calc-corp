import { useState } from "react"

import { Debt } from "../../../domain/debt"
import { DebtItem } from "./DebtItem"

type Props = {
    debt: Debt
    setDebt?: (debt: Debt) => void
    deleteDebt?: (debt: Debt) => void
}

export const DebtView = ({ debt, setDebt, deleteDebt }: Props) => {
    const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false)
    const [editPaymentOpened, setEditPaymentOpened] = useState(false)
    const [deletePaymentConfirmOpened, setDeletePaymentConfirmOpened] =
        useState(false)

    return <DebtItem debt={debt} />
}
