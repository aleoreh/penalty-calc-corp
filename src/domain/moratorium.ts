export type Moratorium = [Date, Date] & { __brand: Moratorium }

export const moratoriumFromTuple = ([start, end]: [Date, Date]) =>
    [new Date(start), new Date(end)] as Moratorium

const moratoriums = {
    fromTuple: moratoriumFromTuple,
}

export default moratoriums
