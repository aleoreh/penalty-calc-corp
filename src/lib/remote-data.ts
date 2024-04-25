import * as remoteDataLib from "srd"
import { type RD as RDLib } from "srd"

export const remoteData = remoteDataLib

export type RD<E, A> = RDLib<E, A>
