import clsx from "clsx"
import ReactDOM from "react-dom"

import style from "./Popup.module.css"

const popupElement = document.getElementById("popup")

type PopupProps = {
    isOpened: boolean
    children?: JSX.Element | JSX.Element[]
}

export const Popup = ({ isOpened, children }: PopupProps) => {
    return ReactDOM.createPortal(
        <div className={clsx(style.popup, isOpened && style.is_opened)}>
            <div className={style.content}>{children}</div>
        </div>,
        popupElement!
    )
}
