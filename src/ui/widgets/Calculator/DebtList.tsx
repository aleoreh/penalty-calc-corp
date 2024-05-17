import "css.gg/icons/css/add-r.css"

import { UI } from "../../types"
import { Popup } from "../../components/Popup"
import {
    inputDecoders,
    useValidatedForm,
    useValidatedInput,
} from "../../formValidation"
import { useState } from "react"
import dayjs from "dayjs"
import { usePopup } from "../../components/Popup/Popup"
import { Form } from "../../components/Form"
import { Input } from "../../components/Input"

export const DebtList: UI.DebtList = ({ debts, setDebts }) => {
    const [lastInputDebtPeriod, setLastInputDebtPeriod] = useState(new Date())
    const [lastInputDebtAmount, setLastInputDebtAmount] = useState(0)
    const [popupOpened, setPopupOpened] = useState<boolean>(false)

    const periodInput = useValidatedInput(
        dayjs(lastInputDebtPeriod).format("YYYY-MM-DD"),
        "Период",
        inputDecoders.date,
        {
            type: "month",
            id: "debt-period",
            name: "debtPeriod",
        }
    )

    const dueDateInput = useValidatedInput(
        dayjs(lastInputDebtPeriod).format("YYYY-MM-DD"),
        "Начало просрочки",
        inputDecoders.date,
        {
            type: "date",
            id: "due-date",
            name: "dueDate",
        }
    )

    const debtAmountInput = useValidatedInput(
        String(lastInputDebtAmount),
        "Сумма долга",
        inputDecoders.decimal,
        {
            type: "text",
            id: "debt-amount",
            name: "debtAmount",
        }
    )

    const submitDebtAdd = () => {
        return
    }

    const debtAddForm = useValidatedForm(
        [periodInput, dueDateInput, debtAmountInput],
        submitDebtAdd,
        () => {
            setPopupOpened(false)
        }
    )

    const popup = usePopup(popupOpened, () => {
        debtAddForm.reset()
        setPopupOpened(false)
    })

    return (
        <>
            <div>
                <button
                    title="Добавить"
                    type="button"
                    onClick={() => setPopupOpened(true)}
                >
                    <span className="gg-add-r"></span>
                </button>
            </div>
            <Popup {...popup}>
                <Form {...debtAddForm}>
                    <Input {...periodInput} />
                    <Input {...dueDateInput} />
                    <Input {...debtAmountInput} />
                </Form>
            </Popup>
        </>
    )
}
