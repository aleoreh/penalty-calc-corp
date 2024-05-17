import Backdrop from "@mui/material/Backdrop"
import Box from "@mui/material/Box"
import { useRef } from "react"
import { useModalClose } from "../../hooks/useModalClose"
import style from "./Popup.module.css"

type PopupProps = {
    isOpened: boolean
    close: () => void
    children?: JSX.Element | JSX.Element[]
}

export const Popup = ({ isOpened, close, children }: PopupProps) => {
    const contentRef = useRef<HTMLDivElement | null>(null)

    useModalClose({
        isOpened,
        setClosed: close,
        containerRef: contentRef,
    })

    return (
        <Backdrop open={isOpened}>
            <Box ref={contentRef} className={style.content}>
                {children}
            </Box>
        </Backdrop>
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
