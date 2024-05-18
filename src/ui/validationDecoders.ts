import dayjs from "dayjs"
import { date, regex, string } from "decoders"

export const inputDecoders = {
    decimal: string
        .pipe(regex(/^\d*\.?\d*$/, "Ожидается число"))
        .transform(parseFloat),
    date: string
        .transform((x) => dayjs(x).toDate())
        .pipe(date)
        .describe("Ожидается дата"),
}
