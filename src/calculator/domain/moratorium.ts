export type Moratorium = [Date, Date]

export const moratoriumFromTuple = ([start, end]: [Date, Date]) =>
    [new Date(start), new Date(end)] as Moratorium

export const moratoriums = {
    fromTuple: moratoriumFromTuple,
}

export default moratoriums
