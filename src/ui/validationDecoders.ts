import dayjs from "dayjs"
import { date, regex, string } from "decoders"

export const inputDecoders = {
    decimal: string
        .pipe(regex(/^\d*[.,]?\d*$/, "Ожидается число"))
        .transform((x) => x.replaceAll(",", "."))
        .transform(parseFloat),
    date: string
        .transform((x) =>
            dayjs(x, [
                "DD.MM.YYYY",
                "DD.MM.YY",
                "YYYY-MM-DD",
                "YY-MM-DD",
            ]).toDate()
        )
        .pipe(date)
        .describe("Ожидается дата"),
    fullMonth_year: string
        .transform((x) => dayjs(x, "MMMM YYYY").toDate())
        .pipe(date)
        .describe("Ожидается дата в формате MMMM YYYY"),
    year_fullMonth: string
        .transform((x) => dayjs(x, "YYYY MMMM").toDate())
        .pipe(date)
        .describe("Ожидается дата в формате YYYY MMMM"),
}

