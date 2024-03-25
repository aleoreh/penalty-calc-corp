import { Close } from "@mui/icons-material"
import IconButton from "@mui/material/IconButton"
import Snackbar from "@mui/material/Snackbar"

type CustomSnackbarProps = {
    open: boolean
    message: string
    onClose: () => void
}

export function CustomSnackbar(props: CustomSnackbarProps) {
    return (
        <Snackbar
            open={props.open}
            message={props.message}
            autoHideDuration={6000}
            onClose={props.onClose}
            action={
                <>
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        sx={{ p: 0.5 }}
                        onClick={props.onClose}
                    >
                        <Close />
                    </IconButton>
                </>
            }
        />
    )
}
