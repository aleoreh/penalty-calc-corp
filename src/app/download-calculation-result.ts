import dayjs from "dayjs"
import writeXlsxFile from "write-excel-file"
import {
    CalculationResult,
    CalculationResultItem,
} from "../domain/calculation-result"
import { formatKeyRatePart } from "../domain/keyrate-part"
import { formatPercent } from "../utils"

// ~~~~~~~~~~~~~~~ helpers ~~~~~~~~~~~~~~~ //

function generateFileName(calculationDate: Date): string {
    return `Пеня_${calculationDate.toDateString()}.xlsx`
}

function getResultsTotal(calculationResults: CalculationResult[]): number {
    return calculationResults
        .map((calculationResult) =>
            calculationResult.rows.reduce((acc, x) => acc + x.penaltyAmount, 0)
        )
        .reduce((acc, x) => acc + x, 0)
}

async function download(
    calculationDate: Date,
    rows: CalculationResult[]
): Promise<void> {
    const data = rows
        .map((row) => [
            dayjs(row.period).format("MMMM YYYY"),
            row.rows as CalculationResultItem[] | string | number | undefined,
        ])
        .concat([undefined, getResultsTotal(rows)])
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
                    typeof x === "string" ||
                    typeof x === "number" ||
                    typeof x === "number" ||
                    typeof x === "undefined"
                        ? undefined
                        : x.debtAmount,
            },
            {
                column: "Период с",
                type: Date,
                value: (x) =>
                    typeof x === "string" ||
                    typeof x === "number" ||
                    typeof x === "undefined"
                        ? undefined
                        : x.dateFrom,
                format: "dd.mm.yyyy",
            },
            {
                column: "Период по",
                type: Date,
                value: (x) =>
                    typeof x === "string" ||
                    typeof x === "number" ||
                    typeof x === "undefined"
                        ? undefined
                        : x.dateTo,
                format: "dd.mm.yyyy",
            },
            {
                column: "Всего дней",
                type: Number,
                value: (x) =>
                    typeof x === "string" ||
                    typeof x === "number" ||
                    typeof x === "undefined"
                        ? undefined
                        : x.totalDays,
            },
            {
                column: "Доля ставка",
                type: String,
                value: (x) =>
                    typeof x === "string" ||
                    typeof x === "number" ||
                    typeof x === "undefined"
                        ? undefined
                        : formatKeyRatePart(x.ratePart),
            },
            {
                column: "Ставка",
                type: String,
                value: (x) =>
                    typeof x === "string" ||
                    typeof x === "number" ||
                    typeof x === "undefined"
                        ? undefined
                        : formatPercent(x.rate),
            },
            {
                column: "Расчет",
                type: String,
                value: (x) =>
                    typeof x === "string" || typeof x === "undefined"
                        ? undefined
                        : typeof x === "number"
                        ? "Итого:"
                        : x.formula,
            },
            {
                column: "Сумма пени",
                type: Number,
                value: (x) =>
                    typeof x === "string" || typeof x === "undefined"
                        ? undefined
                        : typeof x === "number"
                        ? Math.round(x * 100) / 100
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
    await download(calculationDate, [calculationResult])
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

