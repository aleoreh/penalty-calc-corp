import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
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
import {
    useValidatedForm,
    useValidatedInput,
} from "../../formValidation"
import { UI } from "../../types"
import { inputDecoders } from "../../validationDecoders"

import styles from "./Calculator.module.css"

type SettingsTableProps = {
    calculationDate: Date
    config: CalculatorConfig
}

const SettingsTable = ({ config }: SettingsTableProps) => {
    return (
        <TableContainer>
            <Table>
                <caption className={styles.settings_table_caption}>
                    Настройки расчета
                </caption>
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
            <Box className="calculator-settings" component="section">
                <Container>
                    <Stack direction="row">
                        <SettingsTable {...props} />
                        <Button
                            title="Редактировать"
                            type="button"
                            onClick={open}
                        >
                            <CreateOutlinedIcon></CreateOutlinedIcon>
                        </Button>
                    </Stack>
                </Container>
            </Box>
            <Popup {...popup}>
                <Form {...form}>
                    <Input {...keyRateInput} />
                </Form>
            </Popup>
        </>
    )
}

