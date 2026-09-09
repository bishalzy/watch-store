/* eslint-disable react-hooks/exhaustive-deps */
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Footer from "./components/ui/Footer/Footer";
import Navbar from "./components/ui/Navbar/Navbar";
import { useUIStore } from "./store/uiStore";
import * as React from "react";
import { useAuthStore } from "./store/authStore";
import { useUserStore } from "./store/userStore";
import { validateToken } from "./services/api/auth/authAPI";

import AIChatWidget from "./components/ui/AIChat/AIChatWidget";

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const navigate = useNavigate();

  const navbarHeight = useUIStore((state) => state.navbarHeight);

  const setIsJWTChecked = useAuthStore((state) => state.setIsJWTChecked);
  const isUserSignedIn = useAuthStore((state) => state.isUserSignedIn);
  const userSignedIn = useAuthStore((state) => state.userSignedIn);
  const userSignedOut = useAuthStore((state) => state.userSignedOut);

  const globalUsername = useUserStore((state) => state.globalUsername);
  const setGlobalUsername = useUserStore((state) => state.setGlobalUsername);
  const setGlobalEmail = useUserStore((state) => state.setGlobalEmail);
  const setRole = useUserStore((state) => state.setRole);
  const setUserID = useUserStore((state) => state.setUserID);

  async function validateCookieToken() {
    try {
      const response = await validateToken();
      setGlobalEmail(response.email);
      setGlobalUsername(response.username)
      setRole(response.role);
      setUserID(response.id);
      userSignedIn();
    } catch (error) {
      console.log(error);
      navigate("/", { replace: true });
      userSignedOut();
    } finally {
      setIsJWTChecked(true);
    }
  }

  React.useEffect(() => {
    if (isUserSignedIn) validateCookieToken();
  }, [isUserSignedIn, globalUsername]);
  return (
    <>
      <Navbar />
      <div className="min-h-dvh outerDivBackgroundColour" style={{ paddingTop: `${navbarHeight ?? 121}px` }}>
        <ScrollToTop />
        <Outlet />
      </div>
      <Footer />
      <AIChatWidget />
    </>
  );
}

export default App;
