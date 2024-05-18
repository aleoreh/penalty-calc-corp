import { AddOutlined } from "@mui/icons-material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Stack from "@mui/material/Stack"
import { DatePicker } from "@mui/x-date-pickers"
import dayjs, { Dayjs } from "dayjs"
import { useState } from "react"

import { createEmptyDebt, getDefaultDueDate } from "../../../domain/debt"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"
import { Popup } from "../../components/Popup"
import { usePopup } from "../../components/Popup/Popup"
import {
    inputDecoders,
    useValidatedForm,
    useValidatedInput,
} from "../../formValidation"
import { UI } from "../../types"
import List from "@mui/material/List"
import { DebtView } from "../DebtView"

export const DebtList: UI.DebtList = ({ config, debts, setDebts }) => {
    const [inputDebtPeriod, setInputDebtPeriod] = useState<Dayjs | null>(
        dayjs()
    )
    const [dueDate, setDueDate] = useState<Dayjs | null>(dayjs())

    const [popupOpened, setPopupOpened] = useState<boolean>(false)

    const debtAmountInput = useValidatedInput(
        String(0),
        "Сумма долга",
        inputDecoders.decimal,
        {
            type: "text",
            id: "debt-amount",
            name: "debtAmount",
        }
    )

    const submitDebtAdd = () => {
        const newDebt =
            inputDebtPeriod &&
            createEmptyDebt(inputDebtPeriod.toDate(), config.daysToPay)
        newDebt && setDebts([...debts, newDebt])
    }

    const submitDebtAddAndContinue = () => {
        submitDebtAdd()
        open()
    }

    const debtAddForm = useValidatedForm(
        [debtAmountInput],
        submitDebtAdd,
        () => {
            setPopupOpened(false)
        }
    )

    const popup = usePopup(popupOpened, () => {
        debtAddForm.reset()
        setPopupOpened(false)
    })

    const open = () => {
        debtAddForm.reset()
        setPopupOpened(true)
    }

    const handleInputDebtPeriodChange = (value: Dayjs | null) => {
        setInputDebtPeriod(value)
        value &&
            setDueDate(
                dayjs(getDefaultDueDate(value.toDate(), config.daysToPay))
            )
    }

    return (
        <>
            <Box component="section">
                <Container maxWidth="md">
                    <Button title="Добавить" type="button" onClick={open}>
                        <AddOutlined></AddOutlined>
                    </Button>
                    <List>
                        {debts.map((debt, i) => (
                            <DebtView
                                // key={debt.period.toISOString()}
                                key={i}
                                debt={debt}
                            />
                        ))}
                    </List>
                </Container>
            </Box>
            <Popup {...popup}>
                <Form
                    {...debtAddForm}
                    submitAndContinue={submitDebtAddAndContinue}
                >
                    <Stack>
                        <DatePicker
                            label={"Период"}
                            value={inputDebtPeriod}
                            onChange={handleInputDebtPeriodChange}
                            views={["month"]}
                            view="month"
                        />
                        <DatePicker
                            label={"Начало просрочки"}
                            value={dueDate}
                            onChange={setDueDate}
                        />
                        <Input {...debtAmountInput} />
                    </Stack>
                </Form>
            </Popup>
        </>
    )
}

