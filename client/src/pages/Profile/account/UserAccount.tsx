import Button from "../../../components/ui/Button/Button";
import { useAuthStore } from "../../../store/authStore";
import { useUserStore } from "../../../store/userStore";
import { useNavigate } from "react-router-dom";
import ProfileContentContainer from "../container/ProfileContentContainer";
import * as React from "react";
import { useCartStore } from "../../../store/cartStore";
import { updateUsername } from "../../../services/api/user/userAPI";
import axios from "axios";
import useForm from "../../../hooks/useForm";
import { logoutAPI } from "../../../services/api/auth/authAPI";
import { ErrorMessage } from "../../../components/ui/Error/ErrorMessage";

export default function UserAccount() {
  const globalUsername = useUserStore((state) => state.globalUsername);
  const globalEmail = useUserStore((state) => state.globalEmail);
  const setGlobalUsername = useUserStore((state) => state.setGlobalUsername);

  const isJWTChecked = useAuthStore((state) => state.isJWTChecked);
  const userSignedOut = useAuthStore((state) => state.userSignedOut);
  const setIsJWTChecked = useAuthStore((state) => state.setIsJWTChecked);
  const clearAllValues = useAuthStore((state) => state.clearAllValues);

  const clearCart = useCartStore((state) => state.clearCart);

  const [isEmailRevealed, setIsEmailRevealed] = React.useState<boolean>(false);
  const [editedUsernameValue, setEditedUsernameValue] = React.useState<string | null>(null);
  const [updateNameError, setUpdateNameError] = React.useState<string | null>(null);
  const [logoutError, setLogoutError] = React.useState<string | null | unknown>(null);

  const navigate = useNavigate();

  const initialDirtyFieldState = {
    username: false,
  }

  const { handleSuccessfulResponse } = useForm(initialDirtyFieldState);

  async function handleLogOut() {
    try {
      await logoutAPI();
      setIsJWTChecked(false);
      userSignedOut();
      clearCart();
      navigate("/");
      clearAllValues();
    } catch (error) {
      console.log(error);
      setLogoutError(error);
    }
  }

  function modifiedEmail(email: string): string {
    if (isEmailRevealed) {
      return email;
    }
    const index = email.indexOf("@");
    return "*****" + email.substring(index);
  }

  async function handleUsernameUpdate() {
    if (editedUsernameValue === "") return setUpdateNameError("Username cannot be empty");
    try {
      if (editedUsernameValue) {
        const response = await updateUsername({ updatedUsername: editedUsernameValue, userEmail: globalEmail });
        console.log(response);
        if (response) {
          setGlobalUsername(response.username);
          handleSuccessfulResponse(response);
          setEditedUsernameValue(null);
        }
      }
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        setUpdateNameError(error.message);
      }
    }
  }

  return (
    <>
      {/**
       * `isLoading` is passed as the *inverse* of `isJWTChecked`, because:
       * - `isJWTChecked = false` means the token is still verifying, so the Loader should be displayed.
       * - `isJWTChecked = true` means the token is done verifying, so the content should be displayed.
       *
       * If we passed `isJWTChecked` directly, the logic would be reversed (loader would show after verification).
       *
       * See `ProfileContentContainer` to make this more clear.
       */}
      <ProfileContentContainer title="My Account" isLoading={!isJWTChecked}>
        <div className="min-h-dvh w-full lg:w-[80%] xl:w-1/2 p-2 md:p-6">
          <div className="innerDivBackgroundColour p-6 rounded-2xl shadow-lg border border-white/10">
            <div className="flex flex-col gap-4 md:gap-7 text-white">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg mb-1">Username</h3>
                <div className="flex justify-between items-center">
                  {
                    editedUsernameValue != null ?
                      (
                        <div className="flex flex-col gap-4 md:flex-row justify-between w-full">
                          <div className="flex flex-col">
                            <input
                              value={editedUsernameValue}
                              autoFocus
                              className={`outline-none bg-transparent text-white border-b-2 
                              ${updateNameError ? "border-red-600" : "border-white"}`
                              }
                              onChange={(e) => {
                                setUpdateNameError(null);
                                if (e.target.value === "") {
                                  setUpdateNameError("Username cannot be empty");
                                }
                                setEditedUsernameValue(e.target.value)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  setEditedUsernameValue(null);
                                } else if (e.key === "Enter") {
                                  handleUsernameUpdate();
                                }
                              }}
                            />
                            {updateNameError && <span className="text-[13px] text-red-600">{updateNameError}</span>}
                          </div>
                          <div className="flex gap-4 items-center justify-between">
                            <Button
                              textValue="Save"
                              className="border-2 border-white py-1 hover:bg-white hover:text-black w-[100px]"
                              onClick={handleUsernameUpdate}
                            />
                            <Button
                              textValue="Cancel"
                              className="border-2 border-white py-1 hover:bg-white hover:text-black w-[100px]"
                              onClick={() => setEditedUsernameValue(null)}
                            />
                          </div>
                        </div>
                      ) :
                      (
                        <>
                          <div className="font-normal text-white/90">{globalUsername ?? "No username"}</div>
                          <Button
                            textValue="Edit"
                            className="border-2 border-white py-1 hover:bg-white hover:text-black w-[100px]"
                            onClick={() => setEditedUsernameValue(globalUsername)}
                          />
                        </>
                      )
                  }
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg mb-1">Email</h3>
                <div className="flex justify-between items-center">
                  <div className="font-normal text-white/90">{modifiedEmail(globalEmail)}</div>
                  <Button
                    textValue={isEmailRevealed ? "Hide" : "Show"}
                    className="border-2 border-white py-1 hover:bg-white hover:text-black w-[100px]"
                    onClick={() => setIsEmailRevealed(!isEmailRevealed)}
                  />
                </div>
              </div>
              <div className="flex justify-end border-t-2 border-t-white/20 mt-10 md:mt-20">
                {logoutError ? <ErrorMessage message="Could not log out. Try again later" className="text-center" /> : null}
                <Button
                  textValue="Log Out"
                  onClick={handleLogOut}
                  className="border-2 bg-red-600 w-[100px] py-1 px-2 h-[50%] mt-5 text-[12px] whitespace-nowrap hover:bg-red-800 hover:text-white focus:bg-red-800 focus:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </ProfileContentContainer>
    </>
  );
}
