import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import { useState } from "react"

type ConfirmDialogProps<T> = {
    id?: string
    value?: T
    open: boolean
    onClose: (value?: T) => void
    title: string
    confirmText: string
}

export const ConfirmDialog = <T,>(props: ConfirmDialogProps<T>) => {
    const { onClose, value, open, title, confirmText, id } = props

    const handleOk = () => {
        onClose(value)
    }

    const handleCancel = () => {
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleCancel} id={id}>
            <DialogTitle>{title}</DialogTitle>
            <DialogActions>
                <Button onClick={handleOk}>{confirmText}</Button>
                <Button autoFocus onClick={handleCancel}>
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    )
}

type UseConfirmDialogParams<T> = Omit<
    ConfirmDialogProps<T>,
    "value" | "title" | "confirmText"
>

type UseConfirmDialogConfig<T> = Pick<
    ConfirmDialogProps<T>,
    "value" | "title" | "confirmText"
>

type UseConfirmDialogResult<T> = ConfirmDialogProps<T> & {
    configure: (config: UseConfirmDialogConfig<T>) => void
}

export const useConfirmDialog = <T,>(
    params: UseConfirmDialogParams<T>
): UseConfirmDialogResult<T> => {
    const [config, setConfig] = useState<UseConfirmDialogConfig<T>>({
        value: undefined,
        title: "",
        confirmText: "OK",
    })

    return {
        configure: setConfig,
        ...params,
        ...config,
    }
}

