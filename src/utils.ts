import dayjs, { Dayjs } from "dayjs"

export const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
    }).format(value)

const formatDate =
    (formatString: string) =>
    (value: Date | Dayjs): string =>
        value instanceof Date
            ? dayjs(value).format(formatString)
            : value.format(formatString)

export const formatPeriod = formatDate("MMMM YYYY")

export const formatDateLong = formatDate("LL")

export const formatDateLongDayOfWeek = formatDate("ddd, LL")

export const formatDateShort = formatDate("L")

export const formatPercent = (value: number): string =>
    new Intl.NumberFormat("ru-RU", {
        style: "percent",
        maximumFractionDigits: 3,
    }).format(value)
