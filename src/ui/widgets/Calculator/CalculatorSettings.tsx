import "css.gg/icons/css/pen.css"
import { string } from "decoders"
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
    useValidatedForm,
    useValidatedInput
} from "../../formValidation"
import { UI } from "../../types"

import styles from "./Calculator.module.css"

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

    const [editFormOpened, setEditFormOpened] = useState<boolean>(false)

    const keyRateInput = useValidatedInput(
        numberToPercent(config.keyRate).toString(),
        "Ключевая ставка, %",
        string
            .transform(parseFloat)
            .refine((x) => !isNaN(x), "Здесь должно быть число"),
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

    const form = useValidatedForm([keyRateInput], submit, () => setEditFormOpened(false))

    return (
        <>
            <section className={styles.calculator_settings}>
                <SettingsTable {...props} />
                <button
                    title="Редактировать"
                    type="button"
                    onClick={() => setEditFormOpened(true)}
                >
                    <span className="gg-pen"></span>
                </button>
            </section>
            <Popup isOpened={editFormOpened} close={form.onClose}>
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

