import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import { useState } from "react"

import {
    CalculatorConfig,
    LegalPersonType,
    isLegalPersonType,
    withLegalPersonType,
} from "../../../domain/calculator-config"
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

import { ExpandMoreOutlined } from "@mui/icons-material"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import FormControl from "@mui/material/FormControl"
import IconButton from "@mui/material/IconButton"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import Typography from "@mui/material/Typography"

type SettingsTableProps = {
    calculationDate: Date
    config: CalculatorConfig
    setConfig: (value: CalculatorConfig) => void
    defaultConfig: CalculatorConfig
}

const SettingsTable = ({ config, setConfig }: SettingsTableProps) => {
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
            <TableContainer className="settings-table">
                <Table>
                    <TableBody>
                        <TableRow key="keyRate">
                            <TableCell>
                                Ключевая ставка на дату расчета
                            </TableCell>
                            <TableCell>
                                {numberToPercent(config.keyRate)}%
                            </TableCell>
                            <TableCell align="right">
                                <IconButton
                                    title="Редактировать"
                                    type="button"
                                    onClick={open}
                                    sx={{ alignSelf: "flex-end" }}
                                    size="small"
                                >
                                    <CreateOutlinedIcon></CreateOutlinedIcon>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                        <TableRow key="daysToPay">
                            <TableCell>Дней на оплату</TableCell>
                            <TableCell>{config.daysToPay}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                        <TableRow key="deferredDaysCount">
                            <TableCell>Дней на отсрочку</TableCell>
                            <TableCell>{config.deferredDaysCount}</TableCell>
                            <TableCell></TableCell>
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
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Popup {...popup}>
                <Form {...form}>
                    <Input {...keyRateInput} />
                </Form>
            </Popup>
        </>
    )
}

export const CalculatorSettings: UI.CalculatorSettings = (props) => {
    const { setConfig, config, defaultConfig } = props

    const [legalPersonType, setLegalPersonType] =
        useState<LegalPersonType>("natural")

    const handleLegalPersonTypeChange = (event: SelectChangeEvent) => {
        const value = event.target.value as string

        if (!isLegalPersonType(value)) return

        setConfig(withLegalPersonType(value, config, defaultConfig))
        setLegalPersonType(value)
    }

    return (
        <>
            <Stack className="calculator-settings">
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
                        <Typography component="h2" variant="h6">
                            Настройки
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack>
                            <SettingsTable {...props} />
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <FormControl fullWidth>
                    <InputLabel id="legal-person-type-select-label">
                        Порядок расчёта
                    </InputLabel>
                    <Select
                        labelId="legal-person-type-select-label"
                        id="legal-person-type-select"
                        value={legalPersonType}
                        label="Порядок расчёта"
                        onChange={handleLegalPersonTypeChange}
                    >
                        <MenuItem value={"natural"}>Физическое лицо</MenuItem>
                        <MenuItem value={"juridical"}>
                            Юридическое лицо
                        </MenuItem>
                    </Select>
                </FormControl>
            </Stack>
        </>
    )
}

