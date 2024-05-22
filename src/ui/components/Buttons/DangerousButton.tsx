import Button from "@mui/material/Button"
import { styled } from "@mui/material/styles"

export const DangerousButton = styled(Button)(() => ({
    opacity: 0.5,
    textTransform: "lowercase",
}))
