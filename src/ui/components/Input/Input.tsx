type InputProps = {
    id: string | undefined
    label: string
    attributes: Partial<React.InputHTMLAttributes<HTMLInputElement>>
    value: string
    error: string | null
}

export const Input = ({ id, label, attributes, value, error }: InputProps) => {
    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <input {...attributes} value={value} className="input" />
            <small>{error || ""}</small>
        </div>
    )
}
