import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import { useRef } from "react"

import style from "./Popup.module.css"

type PopupProps = {
    isOpened: boolean
    close: () => void
    children?: JSX.Element | JSX.Element[]
}

export const Popup = ({ isOpened, close, children }: PopupProps) => {
    const contentRef = useRef<HTMLDivElement | null>(null)

    return (
        <Dialog open={isOpened} onClose={close}>
            <Box ref={contentRef} className={style.content}>
                {children}
            </Box>
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
