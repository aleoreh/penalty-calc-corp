import TextField from "@mui/material/TextField"

type InputProps = {
    label: string
    attributes: Pick<
        React.InputHTMLAttributes<HTMLInputElement>,
        "name" | "onChange" | "onBlur" | "id"
    >
    value: string
    error: string | null
}

export const Input = ({ label, attributes, value, error }: InputProps) => {
    return (
        <TextField
            {...attributes}
            value={value}
            label={label}
            error={!!error}
            helperText={error}
        />
    )
}
