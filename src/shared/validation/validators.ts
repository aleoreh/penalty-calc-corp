import { GetValidator } from "./validation"

export const required: GetValidator<string, string> = (
    message = "Поле должно быть заполнено"
) => {
    return async (value) => (value === null ? null : message)
}

export const isNumber: GetValidator<string, string> = (
    message = "Здесь должно быть число"
) => {
    return async (value) =>
        value !== undefined && !isNaN(parseFloat(value)) ? null : message
}
