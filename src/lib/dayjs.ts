import dayjsDef, { Dayjs as DayjsType } from "dayjs"
import "dayjs/locale"
import isBetween from "dayjs/plugin/isBetween"

dayjsDef.extend(isBetween)

export const dayjs = dayjsDef
export type Dayjs = DayjsType

