import "css.gg/icons/css/pen.css"
import { useState } from "react"

import { CalculatorConfig } from "../../../domain/calculator-config"
import { dayjs } from "../../../domain/dayjs"
import {
    Percent,
    numberToPercent,
    percentToNumber,
} from "../../../shared/percent"
import { Form } from "../../components/Form"
import { Popup } from "../../components/Popup"
import {
    inputDecoders,
    useValidatedForm,
    useValidatedInput,
} from "../../formValidation"
import { UI } from "../../types"

import styles from "./Calculator.module.css"
import { usePopup } from "../../components/Popup/Popup"

type SettingsTableProps = {
    calculationDate: Date
    config: CalculatorConfig
}

const SettingsTable = ({ config }: SettingsTableProps) => {
    return (
        <table>
            <caption>Настройки расчета</caption>
            <tbody>
                <tr>
                    <td>Ключевая ставка на дату расчета</td>
                    <td>{numberToPercent(config.keyRate)}%</td>
                </tr>
                <tr>
                    <td>Дней на оплату</td>
                    <td>{config.daysToPay}</td>
                </tr>
                <tr>
                    <td>Дней на отсрочку</td>
                    <td>{config.deferredDaysCount}</td>
                </tr>
                <tr>
                    <td>Действующие моратории</td>
                    <td>
                        {config.moratoriums.map(([start, end], i) => (
                            <p key={i}>
                                {`${dayjs(start).format("L")} - ${dayjs(
                                    end
                                ).format("L")}`}
                            </p>
                        ))}
                    </td>
                </tr>
            </tbody>
        </table>
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

    return (
        <>
            <pre>{JSON.stringify(keyRateInput, undefined, 2)}</pre>
            <pre>{JSON.stringify(form, undefined, 2)}</pre>
            <section className={styles.calculator_settings}>
                <SettingsTable {...props} />
                <button
                    title="Редактировать"
                    type="button"
                    onClick={() => setPopupOpened(true)}
                >
                    <span className="gg-pen"></span>
                </button>
            </section>
            <Popup {...popup}>
                <Form {...form}>
                    <div>
                        <label htmlFor={keyRateInput.attributes.id}>
                            {keyRateInput.label}
                        </label>
                        <input
                            {...keyRateInput.attributes}
                            value={keyRateInput.value}
                            className="input"
                        />
                        <small>
                            {keyRateInput.validatedValue.error?.text || ""}
                        </small>
                    </div>
                </Form>
            </Popup>
        </>
    )
}

