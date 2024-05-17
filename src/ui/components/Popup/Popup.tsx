import clsx from "clsx"
import ReactDOM from "react-dom"

import { useRef } from "react"
import { useModalClose } from "../../hooks/useModalClose"
import style from "./Popup.module.css"

const popupElement = document.getElementById("popup")

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

    return ReactDOM.createPortal(
        <div className={clsx(style.popup, isOpened && style.is_opened)}>
            <div ref={contentRef} className={style.content}>
                {children}
            </div>
        </div>,
        popupElement!
    )
}

type PopupHookResult = {
    isOpened: boolean
    close: () => void
}

export const usePopup = (isOpened: boolean, close: () => void): PopupHookResult => {
    return {
        isOpened,
        close,
    }
}
