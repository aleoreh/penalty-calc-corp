import { DownloadOutlined, SaveAltOutlined } from "@mui/icons-material"
import Button from "@mui/material/Button"
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
import dayjs, { Dayjs } from "dayjs"
import { useEffect, useState } from "react"
import {
    downloadCalculationResult,
    downloadCalculationResults,
} from "../../../app/download-calculation-result"
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
    calculationDate: Dayjs
    calculationResult: CalculationResultType
}

const CalculationResult = ({
    calculationDate,
    calculationResult,
}: CalculationResultProps) => {
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

    // ~~~~~~~~~~~~~~~ download ~~~~~~~~~~~~~~ //

    const [downloadTrigger, setDownloadTrigger] = useState(false)

    useEffect(() => {
        async function download() {
            await downloadCalculationResult(
                calculationDate.toDate(),
                calculationResult
            ).finally(() => {
                setDownloadTrigger(false)
            })
        }

        if (!downloadTrigger) return

        download()
    }, [
        calculationDate,
        calculationResult,
        calculationResult.rows,
        downloadTrigger,
    ])

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <Stack className="calculation-result">
            <Stack direction="row">
                <Typography>
                    {dayjs(calculationResult.period).format("YYYY MMMM")}
                </Typography>
                <Button
                    onClick={() => {
                        setDownloadTrigger(true)
                    }}
                >
                    <DownloadOutlined></DownloadOutlined>
                    Сохранить расчет{" "}
                    {dayjs(calculationResult.period).format("YYYY MMMM")}
                </Button>
            </Stack>
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
        </Stack>
    )
}

// ~~~~~~~~~~~~ main component ~~~~~~~~~~~ //

type Props = {
    calculationDate: Dayjs
    calculationResults: CalculationResultType[]
}

export const CalculationResults = ({
    calculationDate,
    calculationResults,
}: Props) => {
    // ~~~~~~~~~~~~~~~ download ~~~~~~~~~~~~~~ //

    const [downloadTrigger, setDownloadTrigger] = useState(false)

    useEffect(() => {
        async function download() {
            await downloadCalculationResults(
                calculationDate.toDate(),
                calculationResults
            ).finally(() => {
                setDownloadTrigger(false)
            })
        }

        if (!downloadTrigger) return

        download()
    }, [calculationDate, calculationResults, downloadTrigger])

    // ~~~~~~~~~~~~~~~~~ jsx ~~~~~~~~~~~~~~~~~ //

    return (
        <Stack className="calculation-results">
            <Button onClick={() => setDownloadTrigger(true)}>
                <SaveAltOutlined></SaveAltOutlined>
                Сохранить все расчёты
            </Button>
            <List>
                {calculationResults.map((calculationResult) => (
                    <ListItem key={calculationResult.period.toISOString()}>
                        <CalculationResult
                            calculationDate={calculationDate}
                            calculationResult={calculationResult}
                        />
                    </ListItem>
                ))}
            </List>
        </Stack>
    )
}
