// type definition for forms that uses dirty fields
import { GENERAL_ERROR_KEY } from "../utils/constants";

/**
 * Represents the "dirty" state of form fields used in validation.
 *
 * - Each key is a field name (as a string), and the value is a boolean indicating whether the field has been interacted with.
 * - This type is intentionally generic and flexible, allowing it to be used with any form shape.
 */
export type DirtyFieldState<T> = {
  [key in keyof T]: boolean;
};

/**
 * Represents the shape of API error responses for forms.
 * - Contains field-specific errors of type `T` (e.g., email, password).
 * - May also include a general error message under the `[GENERAL_ERROR_KEY]` key (e.g., for network or unknown server errors).
 */
export type APIErrorReturnType<T> = T & {
  [GENERAL_ERROR_KEY]?: string;
};

/**
 * Represents the shape of every form field. These values must be present in every form field (e.g. input, textarea, etc)
 */
export interface BaseFormFieldProps {
  id: string;
  error?: string | undefined;
  useVerticalLabelErrorStyle?: boolean;
}

export interface HandleFieldOnChangeParamter<InputFieldType> {
  fieldKey: keyof InputFieldType;
  newValue: string;
  allFormValues: InputFieldType;
  formValueSetter: (value: string) => void;
  validateFunction: (fields: InputFieldType) => Partial<InputFieldType>;
  setFieldErrorFunction: (inputField: keyof InputFieldType, errorMessage: string) => void;
  clearErrorsFunction: () => void;
  dirtyField: { [K in keyof InputFieldType]: boolean };
}
