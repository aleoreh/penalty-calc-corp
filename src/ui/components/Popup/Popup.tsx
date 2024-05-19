import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"

type PopupProps = {
    isOpened: boolean
    close: () => void
    className?: string
    children?: JSX.Element | JSX.Element[]
}

export const Popup = ({ isOpened, close, className, children }: PopupProps) => {
    return (
        <Dialog className={className} open={isOpened} onClose={close}>
            <Box>{children}</Box>
        </Dialog>
    )
}

type PopupHookResult = {
    isOpened: boolean
    close: () => void
}

export const usePopup = (
    isOpened: boolean,
    close: () => void
): PopupHookResult => {
    return {
        isOpened,
        close,
    }
}

