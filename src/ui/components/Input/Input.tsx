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
        <div>
            <label htmlFor={attributes.id}>{label}</label>
            <input {...attributes} value={value} className="input" />
            <small>{error || ""}</small>
        </div>
    )
}
