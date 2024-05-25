import { ExpandMoreOutlined, FileDownloadOutlined } from "@mui/icons-material"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
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
    getTotalAmount,
} from "../../../domain/calculation-result"
import { formatKeyRatePart } from "../../../domain/keyrate-part"
import { formatCurrency, formatPercent, formatPeriod } from "../../../utils"

function calculationResultsTotal(
    calculationResults: CalculationResultType[]
): number {
    return calculationResults.reduce(
        (acc, calculationResult) => acc + getTotalAmount(calculationResult),
        0
    )
}

// ~~~~~~~~~ CalculationResultRow ~~~~~~~~ //

type CalculationResultRowProps = {
    item: CalculationResultItemType
    index: number
}

const CalculationResultRow = ({ item, index }: CalculationResultRowProps) => {
    return (
        <TableRow key={index} className="calculation-result-row">
            <TableCell align="right">
                {formatCurrency(item.debtAmount)}
            </TableCell>
            <TableCell>{dayjs(item.dateFrom).format("L")}</TableCell>
            <TableCell>{dayjs(item.dateTo).format("L")}</TableCell>
            <TableCell>{item.totalDays}</TableCell>
            <TableCell>{formatKeyRatePart(item.ratePart)}</TableCell>
            <TableCell>{formatPercent(item.rate)}</TableCell>
            <TableCell
                sx={(theme) => ({
                    fontSize: theme.typography.caption,
                })}
            >
                {item.formula}
            </TableCell>
            <TableCell align="right">
                {formatCurrency(item.penaltyAmount)}
            </TableCell>
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
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >
                <Typography variant="h6">
                    {formatPeriod(calculationResult.period)}
                </Typography>
                <Button
                    onClick={() => {
                        setDownloadTrigger(true)
                    }}
                >
                    Сохранить расчет за {formatPeriod(calculationResult.period)}
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
                        {calculationResult.rows.map((item, i) => (
                            <CalculationResultRow item={item} index={i} />
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

    return calculationResults.length > 0 ? (
        <Accordion className="calculation-results" defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                <Typography component="h2" variant="h6">
                    Результат
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Stack className="calculation-results">
                    <Button
                        onClick={() => setDownloadTrigger(true)}
                        sx={{ alignSelf: "flex-end" }}
                        startIcon={<FileDownloadOutlined />}
                    >
                        Сохранить все расчёты
                    </Button>
                    <List>
                        {calculationResults.map((calculationResult) => (
                            <ListItem
                                key={calculationResult.period.toISOString()}
                            >
                                <CalculationResult
                                    calculationDate={calculationDate}
                                    calculationResult={calculationResult}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Typography variant="h5" align="right">
                        Итого:{" "}
                        {formatCurrency(
                            calculationResultsTotal(calculationResults)
                        )}
                    </Typography>
                </Stack>
            </AccordionDetails>
        </Accordion>
    ) : (
        <></>
    )
}

