import clsx from "clsx"
import React, { FormEvent } from "react"

import { FormValidation } from "../../validation/types"
import style from "./Form.module.css"

type ModalFormProps = {
    validation: FormValidation
    reset: () => void
    close: () => void
    submit: { text: string; fn: () => void }
    children?: JSX.Element | JSX.Element[]
}

export const Form = ({
    validation,
    reset,
    close,
    submit,
    children,
}: ModalFormProps) => {
    const handleReset = (evt: React.FormEvent) => {
        evt.preventDefault()
    }

    const handleSubmit = (evt: FormEvent) => {
        evt.preventDefault()
        submit.fn()
        close()
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
                <button title="Отмена" type="button" onClick={close}>
                    Отмена
                </button>
            </div>
            {children}
            <button
                title={submit.text}
                type="submit"
                disabled={!validation.isValid}
            >
                {submit.text}
            </button>
        </form>
    )
}

