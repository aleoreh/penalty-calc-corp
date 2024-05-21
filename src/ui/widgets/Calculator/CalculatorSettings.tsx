import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import { useState } from "react"

import { CalculatorConfig } from "../../../domain/calculator-config"
import { dayjs } from "../../../domain/dayjs"
import {
    Percent,
    numberToPercent,
    percentToNumber,
} from "../../../shared/percent"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input/Input"
import { Popup } from "../../components/Popup"
import { usePopup } from "../../components/Popup/Popup"
import { useValidatedForm, useValidatedInput } from "../../formValidation"
import { UI } from "../../types"
import { inputDecoders } from "../../validationDecoders"

import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import { ExpandMoreOutlined } from "@mui/icons-material"
import AccordionDetails from "@mui/material/AccordionDetails"

type SettingsTableProps = {
    calculationDate: Date
    config: CalculatorConfig
}

const SettingsTable = ({ config }: SettingsTableProps) => {
    return (
        <TableContainer className="settings-table">
            <Table>
                <TableBody>
                    <TableRow key="keyRate">
                        <TableCell>Ключевая ставка на дату расчета</TableCell>
                        <TableCell>
                            {numberToPercent(config.keyRate)}%
                        </TableCell>
                    </TableRow>
                    <TableRow key="daysToPay">
                        <TableCell>Дней на оплату</TableCell>
                        <TableCell>{config.daysToPay}</TableCell>
                    </TableRow>
                    <TableRow key="deferredDaysCount">
                        <TableCell>Дней на отсрочку</TableCell>
                        <TableCell>{config.deferredDaysCount}</TableCell>
                    </TableRow>
                    <TableRow key="moratoriums">
                        <TableCell>Действующие моратории</TableCell>
                        <TableCell>
                            {config.moratoriums.map(([start, end], i) => (
                                <p key={i}>
                                    {`${dayjs(start).format("L")} - ${dayjs(
                                        end
                                    ).format("L")}`}
                                </p>
                            ))}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export const CalculatorSettings: UI.CalculatorSettings = (props) => {
    const { config, setConfig } = props

    const [popupOpened, setPopupOpened] = useState<boolean>(false)

    const keyRateInput = useValidatedInput(
        numberToPercent(config.keyRate).toString(),
        "Ключевая ставка, %",
        inputDecoders.decimal,
        {
            type: "text",
            name: "keyRate",
            id: "key-rate",
        }
    )

    const submit = () => {
        const keyRate = percentToNumber(
            (keyRateInput.validatedValue.value || config.keyRate) as Percent
        )
        setConfig({
            ...config,
            keyRate,
        })
    }

    const form = useValidatedForm([keyRateInput], submit, () =>
        setPopupOpened(false)
    )

    const popup = usePopup(popupOpened, () => {
        form.reset()
        setPopupOpened(false)
    })

    const open = () => {
        form.reset()
        setPopupOpened(true)
    }

    return (
        <>
            <Stack>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        <Typography component="h2" variant="h6">
                            Настройки
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack>
                            <IconButton
                                title="Редактировать"
                                type="button"
                                onClick={open}
                                sx={{alignSelf: "flex-end"}}
                            >
                                <CreateOutlinedIcon></CreateOutlinedIcon>
                            </IconButton>
                            <SettingsTable {...props} />
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </Stack>
            <Popup {...popup}>
                <Form {...form}>
                    <Input {...keyRateInput} />
                </Form>
            </Popup>
        </>
    )
}

