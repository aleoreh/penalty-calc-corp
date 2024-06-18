import dayjs from "dayjs"
import { date, regex, string } from "decoders"

export const inputDecoders = {
    decimal: string
        .pipe(regex(/^\d*[.,]?\d*$/, "Ожидается число"))
        .transform((x) => x.replaceAll(",", "."))
        .transform(parseFloat),
    date: string
        .transform((x) => dayjs(x).toDate())
        .pipe(date)
        .describe("Ожидается дата"),
    monthYear: string
        .transform((x) => dayjs(x, 'MMMM YYYY').toDate())
        .pipe(date)
        .describe("Ожидается дата в формате MMMM YYYY"),
}

