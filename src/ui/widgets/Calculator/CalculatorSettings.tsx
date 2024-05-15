import "css.gg/icons/css/pen.css"
import { string } from "decoders"
import { FormEvent, useState } from "react"

import { CalculatorConfig } from "../../../domain/calculator-config"
import { dayjs } from "../../../domain/dayjs"
import {
    Percent,
    numberToPercent,
    percentToNumber,
} from "../../../shared/percent"
import { Form } from "../../components/Form"
import { Popup } from "../../components/Popup"
import { UI } from "../../types"
import useFormValidation from "../../validation/useFormValidation"
import useValidatedInput from "../../validation/useValidatedInput"

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
    const [inputConfig, setInputConfig] = useState<typeof config>(config)

    const handleKeyRateInput = (evt: FormEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.currentTarget.value)
        if (isNaN(input)) return

        const keyRate = percentToNumber(input as Percent)

        setInputConfig({
            ...inputConfig,
            keyRate,
        })
    }

    const keyRateInput = useValidatedInput(
        "key-rate",
        "keyRate",
        "Ключевая ставка, %",
        string
            .transform(parseFloat)
            .refine((value) => !isNaN(value), "Здесь должно быть число"),
        numberToPercent(config.keyRate)
    )

    const validation = useFormValidation([keyRateInput])

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
            <Popup
                isOpened={editFormOpened}
                close={() => setEditFormOpened(false)}
            >
                <Form
                    validation={validation}
                    close={() => setEditFormOpened(false)}
                    reset={() => {}}
                    submit={{
                        text: "Сохранить",
                        fn: () => setConfig(inputConfig),
                    }}
                >
                    <div>
                        <label htmlFor={keyRateInput.attributes.id}>
                            {keyRateInput.label}
                        </label>
                        <input {...keyRateInput.attributes} className="input" />
                        <small>{keyRateInput.error}</small>
                    </div>
                </Form>
            </Popup>
        </>
    )
}

