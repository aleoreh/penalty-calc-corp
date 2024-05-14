import { DescribeValidator } from "./validation"

const required: DescribeValidator<string, string> = (
    message = "Поле должно быть заполнено"
) => {
    return async (value) => (value === null ? null : message)
}

const isNumber: DescribeValidator<string, string> = (
    message = "В поле должно находиться число"
) => {
    return async (value) =>
        value !== undefined && !isNaN(parseFloat(value)) ? null : message
}

const validators = {
    required,
    isNumber,
}

export default validators
