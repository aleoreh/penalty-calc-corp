import { MakeValidator } from "./validation"

export const required: MakeValidator<string, string> = (
    message = "Поле должно быть заполнено"
) => {
    return async (value) => (value === null ? null : message)
}

export const isNumber: MakeValidator<string, string> = (
    message = "Здесь должно быть число"
) => {
    return async (value) =>
        value !== undefined && !isNaN(parseFloat(value)) ? null : message
}
