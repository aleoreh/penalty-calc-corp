import Opaque, * as O from "ts-opaque"

export type Kopek2 = Opaque<number, "Kopek">

export function numberAsKopek(x: number): Kopek2 {
    return x as Kopek2
}

export const kopekFromRuble = (x: number): Kopek2 => {
    return O.create(Math.round(x * 100))
}

export const kopekToRuble = (x: Kopek2): number => {
    return O.widen(x) / 100
}

export function addKopeks(...xs: Kopek2[]): Kopek2 {
    return xs.reduce((acc, x) => acc + x, 0) as Kopek2
}

export function subtractKopeks(x: Kopek2, y: Kopek2): Kopek2 {
    return (x - y) as Kopek2
}

export function multiplyKopeks(...xs: Kopek2[]): Kopek2 {
    return xs.reduce((acc, x) => acc * x, 0) as Kopek2
}

export function multiplyKopekByScalar(scalar: number) {
    return (x: Kopek2): Kopek2 => (scalar * x) as Kopek2
}

export const kopeks = {
    asKopek: numberAsKopek,
    fromRuble: kopekFromRuble,
    toRuble: kopekToRuble,
    add: addKopeks,
    subtract: subtractKopeks,
    multiply: multiplyKopeks,
    multiplyByScalar: multiplyKopekByScalar,
}

export default kopeks

