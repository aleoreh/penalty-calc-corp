import clsx from "clsx"
import React, { FormEvent } from "react"

import { FormValidation } from "../../formValidation"
import style from "./Form.module.css"

type ModalFormProps = {
    validation: FormValidation
    reset: () => void
    onClose: () => void
    submit: () => void
    children?: JSX.Element | JSX.Element[]
}

export const Form = ({
    validation,
    reset,
    onClose,
    submit,
    children,
}: ModalFormProps) => {
    const handleReset = (evt: React.FormEvent) => {
        evt.preventDefault()
    }

    const handleSubmit = (evt: FormEvent) => {
        evt.preventDefault()
        submit()
        onClose()
    }

    return (
        <form
            className={clsx(style.modal_form)}
            action="none"
            onReset={handleReset}
            onSubmit={handleSubmit}
        >
            <div className={style.dangerous_actions}>
                <button title="Сброс" type="reset" onClick={reset}>
                    Сброс
                </button>
                <button title="Отмена" type="button" onClick={onClose}>
                    Отмена
                </button>
            </div>
            {children}
            <button
                title="Применить"
                type="submit"
                disabled={!validation.isValid}
            >
                Применить
            </button>
        </form>
    )
}

