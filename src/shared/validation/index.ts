import { required } from "./validators"

export {
    type GetValidator,
    type Validator,
    type ValidationResult,
    validate,
} from "./validation"

export const validators = {
    required,
}
