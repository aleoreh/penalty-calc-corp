type ErrorViewProps = { message: string }

export const ErrorView = ({ message }: ErrorViewProps) => {
    return <div>{message}</div>
}
