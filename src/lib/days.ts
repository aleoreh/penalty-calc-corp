export const endOfPeriod = (date: Date, part: "month" | "year"): Date => {
    switch (part) {
        case "year":
            return new Date(Date.UTC(date.getFullYear(), 12, 0))
        case "month":
            return new Date(
                Date.UTC(date.getFullYear(), date.getMonth() + 1, 0)
            )
    }
}

export const beginOfPeriod = (date: Date, part: "month" | "year"): Date => {
    switch (part) {
        case "year":
            return new Date(Date.UTC(date.getFullYear(), 0, 1))
        case "month":
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1))
    }
}

export const addDay = (date: Date, count: number = 1): Date => {
    const res = new Date(date)
    res.setDate(date.getDate() + count)
    return res
}

export const daysEqual = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

export const compareDays = (date1: Date, date2: Date): Ordering => {
    const startOfDay1 = new Date(
        Date.UTC(
            date1.getFullYear(),
            date1.getMonth(),
            date1.getDate(),
            0,
            0,
            0
        )
    )
    const startOfDay2 = new Date(
        Date.UTC(
            date2.getFullYear(),
            date2.getMonth(),
            date2.getDate(),
            0,
            0,
            0
        )
    )
    if (startOfDay1.getTime() < startOfDay2.getTime()) {
        return "LT"
    } else if (startOfDay1.getTime() > startOfDay2.getTime()) {
        return "GT"
    } else {
        return "EQ"
    }
}

export function daysDiff(date1: Date, date2: Date): number {
    return (date2.valueOf() - date1.valueOf()) / 1000 / 3600 / 24
}

export const days = {
    add: addDay,
    beginOfPeriod,
    endOfPeriod,
    equals: daysEqual,
    compare: compareDays,
    diff: daysDiff
}

export default days

