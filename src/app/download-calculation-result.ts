import dayjs from "dayjs"
import writeXlsxFile from "write-excel-file"
import { CalculationResult } from "../domain/calculation-result"
import { formatKeyRatePart } from "../domain/keyrate-part"
import { formatPercent } from "../utils"

// ~~~~~~~~~~~~~~~ helpers ~~~~~~~~~~~~~~~ //

function generateFileName(calculationDate: Date): string {
    return `Пеня_${calculationDate.toDateString()}.xlsx`
}

async function download(
    calculationDate: Date,
    rows: CalculationResult | CalculationResult[]
): Promise<void> {
    const data = (Array.isArray(rows) ? rows : [rows])
        .map((row) => [dayjs(row.period).format("MMMM YYYY"), row.rows])
        .flat(2)
    const fileName = !Array.isArray(rows)
        ? generateFileName(calculationDate)
        : "несколько_" + generateFileName(calculationDate)
    await writeXlsxFile(data, {
        fileName,
        schema: [
            {
                column: "Период",
                type: String,
                value: (x) => (typeof x === "string" ? x : undefined),
            },
            {
                column: "Сумма долга",
                type: Number,
                value: (x) =>
                    typeof x === "string" ? undefined : x.debtAmount,
            },
            {
                column: "Период с",
                type: Date,
                value: (x) => (typeof x === "string" ? undefined : x.dateFrom),
                format: "dd.mm.yyyy",
            },
            {
                column: "Период по",
                type: Date,
                value: (x) => (typeof x === "string" ? undefined : x.dateTo),
                format: "dd.mm.yyyy",
            },
            {
                column: "Всего дней",
                type: Number,
                value: (x) => (typeof x === "string" ? undefined : x.totalDays),
            },
            {
                column: "Доля ставка",
                type: String,
                value: (x) =>
                    typeof x === "string"
                        ? undefined
                        : formatKeyRatePart(x.ratePart),
            },
            {
                column: "Ставка",
                type: String,
                value: (x) =>
                    typeof x === "string" ? undefined : formatPercent(x.rate),
            },
            {
                column: "Расчет",
                type: String,
                value: (x) => (typeof x === "string" ? undefined : x.formula),
            },
            {
                column: "Сумма пени",
                type: Number,
                value: (x) =>
                    typeof x === "string"
                        ? undefined
                        : Math.round(x.penaltyAmount * 100) / 100,
            },
        ],
    })
}

// ~~~~~ download calculation result ~~~~~ //

export type DownloadCalculationResult = (
    calculationDate: Date,
    calculationResult: CalculationResult
) => Promise<void>

export const downloadCalculationResult: DownloadCalculationResult = async (
    calculationDate,
    calculationResult
) => {
    await download(calculationDate, calculationResult)
}

// ~~~~~~~~~~~~ donwnload many ~~~~~~~~~~~ //

export type DownloadCalculationResults = (
    calculationDate: Date,
    calculationResults: CalculationResult[]
) => Promise<void>

export const downloadCalculationResults: DownloadCalculationResults = async (
    calculationDate,
    calculationResults
) => {
    await download(calculationDate, calculationResults)
}
