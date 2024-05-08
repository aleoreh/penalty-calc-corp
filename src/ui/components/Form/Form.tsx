import clsx from "clsx"
import React, { FormEvent } from "react"

import style from "./Form.module.css"

type ModalFormProps = {
    reset: () => void
    close: () => void
    submit: { text: string; fn: () => void }
    children?: JSX.Element | JSX.Element[]
}

export const Form = ({ reset, close, submit, children }: ModalFormProps) => {
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
            <button title={submit.text} type="submit">
                {submit.text}
            </button>
        </form>
    )
}
