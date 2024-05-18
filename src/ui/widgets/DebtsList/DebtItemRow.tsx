import TableRow from "@mui/material/TableRow"

import TableCell from "@mui/material/TableCell"
import dayjs from "dayjs"
import { Debt, getRemainingBalance } from "../../../domain/debt"

type Props = {
    debt: Debt
}

export const DebtItemRow = ({ debt }: Props) => {
    return (
        <TableRow>
            <TableCell>{dayjs(debt.period).format("MMMM YYYY")}</TableCell>
            <TableCell>{dayjs(debt.dueDate).format("L")}</TableCell>
            <TableCell>{debt.amount}</TableCell>
            <TableCell>{getRemainingBalance(debt)}</TableCell>
        </TableRow>
    )
}

