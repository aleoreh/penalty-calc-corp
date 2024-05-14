import { required } from "./validators"

export {
    type MakeValidator as GetValidator,
    type Validator,
    type ValidationResult,
    validate,
} from "./validation"

export { type DefaultField } from "./types"

export const validators = {
    required,
}
