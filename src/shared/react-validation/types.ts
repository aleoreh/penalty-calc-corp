export type DefaultField = {
    id: string
    value: string
    error: null | string
    hasError: () => Promise<boolean>
}
