import * as React from "react";
import { useAuthStore } from "../../../../store/authStore";
import { loginUser, resetPasswordAPI, verifySecurityCode } from "../../../../services/api/auth/authAPI";
import Input from "../../Input/Input";
import { validateLoginForm } from "../../../../utils/validateAuthForm";
import { ErrorMessage } from "../../Error/ErrorMessage";
import { LoginFields, UserDTOResponse } from "../../../../types/authType";
import { DirtyFieldState } from "../../../../types/form";
import useForm from "../../../../hooks/useForm";
import Form from "../../Form/Form";
import Button from "../../Button/Button";
import Loader from "../../Loader/Loader";
import { useUIStore } from "../../../../store/uiStore";
import FormFieldWrapper from "../../FormFieldWrapper/FormFieldWrapper";

interface LoginFormProps {
  hasForgotPassword?: boolean;
  setHasForgotPassword?: (hasForgotPassword: boolean) => void;
}

export default function LoginForm({ hasForgotPassword = false, setHasForgotPassword = () => {} }: LoginFormProps) {
  const loginEmail = useAuthStore((state) => state.loginEmail);
  const loginPassword = useAuthStore((state) => state.loginPassword);
  const securityCode = useAuthStore((state) => state.securityCode);

  const setLoginEmail = useAuthStore((state) => state.setLoginEmail);
  const setLoginPassword = useAuthStore((state) => state.setLoginPassword);
  const setSecurityCode = useAuthStore((state) => state.setSecurityCode);

  const loginErrorFields = useAuthStore((state) => state.loginErrorFields);
  const setLoginError = useAuthStore((state) => state.setLoginError);

  const clearLoginErrors = useAuthStore((state) => state.clearLoginErrors);

  const isLoading = useUIStore((state) => state.isLoading);

  const [isResetPasswordState, setIsResetPasswordState] = React.useState<boolean>(false);


  const initialDirtyFieldState: DirtyFieldState<LoginFields> = {
    email: false,
    password: false,
    securityCode: false,
  };

  const { dirtyField, generalError, isValidationError, handleFormSubmit, handleFieldOnChange, handleSuccessfulResponse } =
    useForm<DirtyFieldState<LoginFields>>(initialDirtyFieldState);

  function handleLoginFieldOnChange(
    fieldKey: keyof LoginFields,
    setter: (value: string) => void
  ) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      handleFieldOnChange<LoginFields>({
        fieldKey,
        newValue,
        allFormValues: {
          email: loginEmail,
          password: loginPassword,
          securityCode: securityCode,
        },
        formValueSetter: setter,
        validateFunction: (fields) => validateLoginForm(fields, { isForgotPassword: hasForgotPassword }),
        setFieldErrorFunction: setLoginError,
        clearErrorsFunction: clearLoginErrors,
        dirtyField,
      });
    };
  }

  async function handleLoginFormSubmit(event: React.FormEvent) {
    event.preventDefault();
    clearLoginErrors();

    const validationError = validateLoginForm(
      { email: loginEmail, password: loginPassword, securityCode: securityCode },
      { isForgotPassword: hasForgotPassword }
    );

    if (isValidationError<LoginFields>(validationError, setLoginError)) return;

    let loginResponse: UserDTOResponse | undefined;
    let verifySecurityCodeResponse: string | undefined;

    if (hasForgotPassword) {
      verifySecurityCodeResponse = await handleFormSubmit<LoginFields, string>({
        apiCall: () => verifySecurityCode({ loginEmail, securityCode }),
        setError: setLoginError,
      });
    } else if (isResetPasswordState) {
      loginResponse = await handleFormSubmit<LoginFields, UserDTOResponse>({
        apiCall: () => resetPasswordAPI({ loginEmail, loginPassword }),
        setError: setLoginError,
      });
    } else {
      loginResponse = await handleFormSubmit<LoginFields, UserDTOResponse>({
        apiCall: () => loginUser({ loginEmail, loginPassword }),
        setError: setLoginError,
      });
    }

    if (loginResponse) {
      await handleSuccessfulResponse(loginResponse);
    } else if (verifySecurityCodeResponse) {
      setIsResetPasswordState(true);
      setHasForgotPassword(false);
      setSecurityCode("");
    }
  }

  function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setHasForgotPassword(!hasForgotPassword);
  }

  return (
    <Form handleFormSubmit={handleLoginFormSubmit}>
      <FormFieldWrapper error={loginErrorFields.email} label="Email" id="login-email" labelClassName="flex">
        <Input
          type="email"
          placeholder="Email"
          value={loginEmail}
          onChange={handleLoginFieldOnChange("email", setLoginEmail)}
          error={loginErrorFields.email}
          id="login-email"
        />
      </FormFieldWrapper>
      {!hasForgotPassword ?
        (
          <FormFieldWrapper
            error={loginErrorFields.password}
            label={isResetPasswordState ? "New password" : "Password"}
            id="login-password"
            labelClassName="flex"
          >
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={handleLoginFieldOnChange("password", setLoginPassword)}
              error={loginErrorFields.password}
              id="login-password"
            />
          </FormFieldWrapper>
        ) : (
          <FormFieldWrapper error={loginErrorFields.securityCode} label="Security Code" id="security-code" labelClassName="flex whitespace-nowrap">
            <Input
              type="password"
              placeholder="Security Code"
              value={securityCode}
              onChange={handleLoginFieldOnChange("securityCode", setSecurityCode)}
              error={loginErrorFields.securityCode}
              id="security-code"
            />
          </FormFieldWrapper>
        )
      }
      <div className="flex justify-end">
        <button onClick={handleForgotPassword} type="button">
          <div className="group flex gap-2 items-end text-[14px]">
            <span className="group-hover:underline underline-offset-4 text-[#1bddf3] text-[14px]">
              {hasForgotPassword ? "I remember the password now" : "Forgot password"}
            </span>
          </div>
        </button>
      </div>
      <Button
        textValue={isLoading ? <Loader /> : (hasForgotPassword ? "Submit" : "Sign In")}
        className="formButtonStyle"
        disabled={isLoading}
        data-testid="login-submit-btn"
      />

      {generalError && <ErrorMessage message={generalError} className="text-center w-full" />}
    </Form>
  );
}
