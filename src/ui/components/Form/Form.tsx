import React, { FormEvent } from "react"

import { styled } from "@mui/material"
import Box, { BoxProps } from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import { FormValidation } from "../../formValidation"
import style from "./Form.module.css"

const StyledForm = styled(Box)<BoxProps<"form">>(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}))

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
        <StyledForm
            component="form"
            className={style.modal_form}
            action="none"
            onReset={handleReset}
            onSubmit={handleSubmit}
        >
            <Stack direction="row">
                <Button title="Сброс" type="reset" onClick={reset}>
                    Сброс
                </Button>
                <Button title="Отмена" type="button" onClick={onClose}>
                    Отмена
                </Button>
            </Stack>
            {children}
            <Button
                title="Применить"
                type="submit"
                disabled={!validation.isValid}
            >
                Применить
            </Button>
        </StyledForm>
    )
}

