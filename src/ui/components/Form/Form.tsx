import { BoxProps } from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import React, { FormEvent } from "react"

import { FormValidation } from "../../formValidation"
import style from "./Form.module.css"

const StyledForm = styled(Card)<BoxProps<"form">>(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}))

type ModalFormProps = {
    validation: FormValidation
    reset: () => void
    onClose: () => void
    submit: () => void
    submitAndContinue?: () => void
    children?: JSX.Element | JSX.Element[]
}

export const Form = ({
    validation,
    reset,
    onClose,
    submit,
    submitAndContinue,
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

    const handleSubmitAndContinue = () => {
        onClose()
        submitAndContinue?.()
    }

    return (
        <StyledForm
            component="form"
            className={style.modal_form}
            action="none"
            onReset={handleReset}
            onSubmit={handleSubmit}
        >
            <CardHeader
                action={
                    <Stack direction="row">
                        <Button title="Сброс" type="reset" onClick={reset}>
                            Сброс
                        </Button>
                        <Button title="Отмена" type="button" onClick={onClose}>
                            Отмена
                        </Button>
                    </Stack>
                }
            />

            <CardContent>{children}</CardContent>
            <CardActions>
                {submitAndContinue && (
                    <Button
                        title="Применить и продолжить"
                        type="button"
                        disabled={!validation.isValid}
                        onClick={handleSubmitAndContinue}
                    >
                        Применить и продолжить
                    </Button>
                )}
                <Button
                    title="Применить"
                    type="submit"
                    disabled={!validation.isValid}
                >
                    Применить
                </Button>
            </CardActions>
        </StyledForm>
    )
}

