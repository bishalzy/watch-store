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
        <div className="min-h-dvh w-full lg:w-[80%] xl:w-1/2 p-4 md:p-8">
          <div className="bg-[#111113] p-6 md:p-8 rounded-sm border border-[#F2EDE4]/10">
            <div className="flex flex-col gap-6 md:gap-8 text-[#F2EDE4]">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs uppercase tracking-wide text-[#F2EDE4]/45">Username</h3>
                <div className="flex justify-between items-center">
                  {
                    editedUsernameValue != null ?
                      (
                        <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between w-full">
                          <div className="flex flex-col">
                            <input
                              value={editedUsernameValue}
                              autoFocus
                              className={`outline-none bg-transparent text-[#F2EDE4] border-b py-1
                              ${updateNameError ? "border-red-500" : "border-[#F2EDE4]/30 focus:border-[#1BDDF3]"}`
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
                            {updateNameError && <span className="text-[12px] text-red-500 mt-1">{updateNameError}</span>}
                          </div>
                          <div className="flex gap-3 items-center">
                            <Button
                              textValue="Save"
                              className="text-xs border border-[#1BDDF3] text-[#1BDDF3] py-1.5 px-4 rounded-sm hover:bg-[#1BDDF3] hover:text-[#0A0A0B] transition-colors duration-150"
                              onClick={handleUsernameUpdate}
                            />
                            <Button
                              textValue="Cancel"
                              className="text-xs border border-[#F2EDE4]/25 text-[#F2EDE4]/70 py-1.5 px-4 rounded-sm hover:border-[#F2EDE4]/50 hover:text-[#F2EDE4] transition-colors duration-150"
                              onClick={() => setEditedUsernameValue(null)}
                            />
                          </div>
                        </div>
                      ) :
                      (
                        <>
                          <div className="text-base">{globalUsername ?? "No username"}</div>
                          <Button
                            textValue="Edit"
                            className="text-xs border border-[#F2EDE4]/25 text-[#F2EDE4]/70 py-1.5 px-4 rounded-sm hover:border-[#F2EDE4]/50 hover:text-[#F2EDE4] transition-colors duration-150"
                            onClick={() => setEditedUsernameValue(globalUsername)}
                          />
                        </>
                      )
                  }
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-6 border-t border-[#F2EDE4]/10">
                <h3 className="text-xs uppercase tracking-wide text-[#F2EDE4]/45">Email</h3>
                <div className="flex justify-between items-center">
                  <div className="text-base">{modifiedEmail(globalEmail)}</div>
                  <Button
                    textValue={isEmailRevealed ? "Hide" : "Show"}
                    className="text-xs border border-[#F2EDE4]/25 text-[#F2EDE4]/70 py-1.5 px-4 rounded-sm hover:border-[#F2EDE4]/50 hover:text-[#F2EDE4] transition-colors duration-150"
                    onClick={() => setIsEmailRevealed(!isEmailRevealed)}
                  />
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 pt-6 border-t border-[#F2EDE4]/10">
                {logoutError ? <ErrorMessage message="Could not log out. Try again later" className="text-center" /> : null}
                <Button
                  textValue="Log Out"
                  onClick={handleLogOut}
                  className="text-xs border border-red-500/40 text-red-400 py-1.5 px-4 rounded-sm hover:bg-red-500 hover:text-[#0A0A0B] hover:border-red-500 transition-colors duration-150"
                />
              </div>
            </div>
          </div>
        </div>
      </ProfileContentContainer>
    </>
  );
}
