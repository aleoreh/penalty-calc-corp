import { Box, Container, Typography } from "@mui/material"

export function PenaltyCalc() {
    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1">
                    Калькулятор пени
                </Typography>
            </Box>
        </Container>
    )
}
