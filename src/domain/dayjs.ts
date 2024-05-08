import dayjsDef, { Dayjs as DayjsType } from "dayjs"
import "dayjs/locale/ru"
import isBetween from "dayjs/plugin/isBetween"
import localizedFormat from "dayjs/plugin/localizedFormat"

dayjsDef.locale("ru")
dayjsDef.extend(isBetween)
dayjsDef.extend(localizedFormat)

export const dayjs = dayjsDef
export type Dayjs = DayjsType

