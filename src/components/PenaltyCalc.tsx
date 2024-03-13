import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import React, { useState } from "react"
import { NumericFormat, NumericFormatProps } from "react-number-format"

const STARTDELAYDAYCOUNT = 11
const STARTPENALTYDAYCOUNT = 31

function delayStartDate(date: Dayjs, startDelayDaysCount: number): Dayjs {
    return date.add(startDelayDaysCount, "day")
}

function deferredCoef(d: Dayjs, startCalcDate: Dayjs) {
    return d.diff(startCalcDate) < 0 ? 0 : 1
}

function delayDelta(d: Dayjs, start: Dayjs) {
    return d.diff(start, "day")
}

function keyRateFraction(delayDays: number, fractionChangeDay: number) {
    return delayDays < fractionChangeDay ? 1 / 300 : 1 / 130
}

function keyRate(calcDate: Dayjs) {
    return 9.5 // TODO: брать из справочника
}

function moratoryCoef(calcDate: Dayjs) {
    return 1 // TODO: брать из справочника
}

function penalty(
    deferredCoef: number,
    keyRateFraction: number,
    keyRate: number,
    debt: number,
    moratoryCoef: number
) {
    return (
        ((deferredCoef * keyRateFraction * keyRate) / 100) * debt * moratoryCoef
    )
}

interface CustomProps {
    onChange: (event: { target: { name: string; value: string } }) => void
    name: string
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
    function NumericFormatCustom(props, ref) {
        const { onChange, ...other } = props

        return (
            <NumericFormat
                {...other}
                getInputRef={ref}
                onValueChange={(values) => {
                    onChange({
                        target: {
                            name: props.name,
                            value: values.value,
                        },
                    })
                }}
                thousandSeparator=" "
                decimalSeparator=","
                decimalScale={2}
                valueIsNumericString
            />
        )
    }
)

export function PenaltyCalc() {
    const [calcDate, setCalcDate] = useState<Dayjs | null>(dayjs())
    const [calcPeriod, setCalcPeriod] = useState<Dayjs | null>(null)
    const [debtSum, setDebtSum] = useState<number>(0)

    function isValid() {
        return !(calcPeriod === null || calcDate === null)
    }

    function startCalculation() {
        if (calcPeriod === null || calcDate === null) return

        const res: [Dayjs, number, number, number, number, number][] = []

        const start = calcPeriod.endOf("month")

        for (let i = start; i.diff(calcDate, "day") <= 0; i = i.add(1, "day")) {
            res.push([
                i,
                debtSum,
                delayDelta(i, start),
                keyRateFraction(delayDelta(i, start), 90),
                moratoryCoef(i),
                penalty(
                    deferredCoef(i, start),
                    keyRateFraction(delayDelta(i, start), 90),
                    keyRate(calcDate),
                    debtSum,
                    moratoryCoef(i)
                ),
            ])
        }

        console.log(res)
    }

    return (
        <Box paddingBlock={2}>
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <Typography variant="h4" component="h1">
                    Калькулятор пеней за ЖКУ
                </Typography>
                <Stack component="form" gap={2}>
                    <Stack>
                        <DatePicker
                            label="Дата расчета"
                            value={calcDate}
                            onAccept={setCalcDate}
                        />
                    </Stack>
                    <Stack>
                        <Typography>
                            Введите сумму долга за расчетный период:
                        </Typography>
                        <Stack>
                            <DatePicker
                                label="Расчетный период, месяц/год"
                                views={["year", "month"]}
                                value={calcPeriod}
                                onChange={setCalcPeriod}
                            />
                            <TextField
                                id="debt-sum-input"
                                label="Сумма долга, р."
                                required
                                InputProps={{
                                    inputComponent: NumericFormatCustom as any,
                                }}
                                value={debtSum}
                                onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    setDebtSum(parseFloat(event.target.value))
                                }}
                            />
                        </Stack>
                        <Typography>
                            или импортируйте долги из таблицы:
                        </Typography>
                        <Button>Импортировать долги</Button>
                    </Stack>
                    <Stack>
                        <Typography>Если долг частично оплачен:</Typography>
                        <Button>Импортировать платежи</Button>
                    </Stack>
                    <Stack direction="row">
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={!isValid()}
                            onClick={startCalculation}
                        >
                            Рассчитать
                        </Button>
                        <Button>Очистить</Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    )
}
