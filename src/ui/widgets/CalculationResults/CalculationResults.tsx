import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import dayjs from "dayjs"
import {
    CalculationResultItem as CalculationResultItemType,
    CalculationResult as CalculationResultType,
} from "../../../domain/calculation-result"
import { formatKeyRatePart } from "../../../domain/keyrate-part"

// ~~~~~~~~~ CalculationResultRow ~~~~~~~~ //

type CalculationResultRowProps = {
    item: CalculationResultItemType
}

const CalculationResultRow = ({ item }: CalculationResultRowProps) => {
    return (
        <TableRow>
            <TableCell>{item.debtAmount}</TableCell>
            <TableCell>{dayjs(item.dateFrom).format("L")}</TableCell>
            <TableCell>{dayjs(item.dateTo).format("L")}</TableCell>
            <TableCell>{item.totalDays}</TableCell>
            <TableCell>{formatKeyRatePart(item.ratePart)}</TableCell>
            <TableCell>{item.rate}</TableCell>
            <TableCell>{item.formula}</TableCell>
            <TableCell>{item.penaltyAmount}</TableCell>
        </TableRow>
    )
}

// ~~~~~~~~~~ CalculationResult ~~~~~~~~~~ //

type CalculationResultProps = {
    calculationResult: CalculationResultType
}

const CalculationResult = ({ calculationResult }: CalculationResultProps) => {
    const fields = [
        "Сумма долга",
        "Период с",
        "Период по",
        "Всего дней",
        "Доля ставки",
        "Ставка",
        "Расчет",
        "Сумма пени",
    ]

    return (
        <TableContainer className="calculation-result">
            <Table>
                <TableHead>
                    <TableRow>
                        {fields.map((field) => (
                            <TableCell>{field}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {calculationResult.rows.map((item) => (
                        <CalculationResultRow item={item} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

// ~~~~~~~~~~~~ main component ~~~~~~~~~~~ //

type Props = {
    calculationResults: CalculationResultType[]
}

export const CalculationResults = ({ calculationResults }: Props) => {
    return (
        <List className="calculation-results">
            {calculationResults.map((calculationResult) => (
                <ListItem key={calculationResult.period.toISOString()}>
                    <Stack>
                        <Typography>
                            {dayjs(calculationResult.period).format(
                                "YYYY MMMM"
                            )}
                        </Typography>
                        <CalculationResult
                            calculationResult={calculationResult}
                        />
                    </Stack>
                </ListItem>
            ))}
        </List>
    )
}
