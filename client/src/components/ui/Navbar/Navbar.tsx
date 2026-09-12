/* eslint-disable react-hooks/exhaustive-deps */
import { NavLink } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { LiaShoppingCartSolid } from "react-icons/lia";
import { FaRegUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import UserMenu from "../UserFormMenu/UserFormMenu";
import { useAuthStore } from "../../../store/authStore";
import { useUIStore } from "../../../store/uiStore";
import { useUserStore } from "../../../store/userStore";
import { Cart } from "../Cart/Cart";
import { useCartStore } from "../../../store/cartStore";
import { useNavbarStore } from "../../../store/navbarStore";
import { ROLES } from "../../../utils/constants";

export default function Navbar() {
  const [openSearchBar, setOpenSearchBar] = React.useState<boolean>(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = React.useState<boolean>(false);
  const [isNavbarBackgroundVisible, setIsNavbarBackgroundVisible] = React.useState<boolean>(false);

  const searchBarRef = React.useRef<HTMLInputElement | null>(null);
  const searchIconRef = React.useRef<HTMLButtonElement | null>(null);
  const bottomNavbarRef = React.useRef<HTMLDivElement | null>(null);
  const navbarRef = React.useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const isUserSignedIn = useAuthStore((state) => state.isUserSignedIn);
  const globalUsername = useUserStore((state) => state.globalUsername);
  const role = useUserStore((state) => state.role);

  const showUserMenu = useUIStore((state) => state.showUserMenu);
  const showCart = useUIStore((state) => state.showCart);
  const setShowUserMenu = useUIStore((state) => state.setShowUserMenu);
  const setShowCart = useUIStore((state) => state.setShowCart);
  const setNavbarHeight = useUIStore((state) => state.setNavbarHeight);

  const cartItems = useCartStore((state) => state.cartItems);

  const setSearchedValue = useNavbarStore((state) => state.setSearchedValue);

  function handleOpenSearchBar() {
    setOpenSearchBar(true);
    setTimeout(() => {
      setIsSearchBarVisible(true);
      searchBarRef.current?.focus();
    }, 0);
  }

  function handleCloseSearchBar(event: MouseEvent) {
    if (
      searchBarRef.current !== null &&
      !searchIconRef.current?.contains(event.target as Node) &&
      !searchBarRef.current?.contains(event.target as Node) &&
      searchBarRef.current.value.trim().length === 0
    ) {
      setIsSearchBarVisible(false);
      setTimeout(() => {
        setOpenSearchBar(false);
      }, 300);
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  function updateNavbarBackgroundOnScroll() {
    const currentScrollPosition = window.scrollY;
    if (currentScrollPosition > 0 && bottomNavbarRef.current) {
      setIsNavbarBackgroundVisible(true);
    } else if (currentScrollPosition === 0 && bottomNavbarRef.current) {
      setIsNavbarBackgroundVisible(false);
    }
  }

  // Go to collection section in home page
  function handleGoToAboutUs() {
    if (location.pathname === "/") {
      const collectionSection = document.getElementById("about-us");
      if (collectionSection) collectionSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // Pass the "state" to the "/" location when navigating. The state is stored in memory by React Router. It can only be read by Home.tsx.
      navigate("/", { state: { scrollTo: "about-us" } });
    }
  }

  function getFirstAlphabetLetter(string: string): string {
    const match = string.match(/[a-zA-Z]/);
    return match ? match[0].toUpperCase() : "?";
  }

  React.useEffect(() => {
    document.addEventListener("click", handleCloseSearchBar);
    return () => {
      document.removeEventListener("click", handleCloseSearchBar);
    };
  }, [openSearchBar]);

  React.useEffect(() => {
    window.addEventListener("scroll", updateNavbarBackgroundOnScroll);

    setNavbarHeight(navbarRef.current!.clientHeight);

    return () => window.removeEventListener("scroll", updateNavbarBackgroundOnScroll);
  }, []);

  return (
    <div ref={navbarRef} className="fixed top-0 flex flex-col justify-between items-center z-20 w-dvw overflow-hidden" data-testid="navbar">
      {showUserMenu && <UserMenu />}
      {showCart && <Cart />}
      <div className="flex w-full py-2 outerDivBackgroundColour text-[#F2EDE4] items-center px-4 justify-end md:px-[50px] md:justify-between">
        <div>
          <span className="text-[11px] text-[#F2EDE4]/45 hidden xl:block md:w-[80%] xl:w-full">Free shipping and returns within 3 days</span>
        </div>
        {openSearchBar && (
          <input
            onChange={(e) => setSearchedValue(e.target.value)}
            ref={searchBarRef}
            className={`${isSearchBarVisible ? "w-[50%] md:w-[65%] xl:w-[50%]" : "w-0 px-0"
              } h-6 bg-[#F2EDE4] text-[#0A0A0B] px-2 outline-none focus:ring-1 focus:ring-[#1BDDF3] transition-all duration-300 absolute right-[160px] md:right-[180px] lg:right-[260px] xl:right-[320px]`}
            placeholder="Search"
          />
        )}
        <div className={`flex items-center justify-end gap-4 lg:justify-between ${
            role !== ROLES.ADMIN ? "w-[200px]" : "w-[100px]"
          }`}
        >
          <button ref={searchIconRef} onClick={handleOpenSearchBar} className="hover:text-[#1BDDF3] transition-colors duration-150" aria-label="Search">
            <IoSearchOutline size={25} />
          </button>
          {role !== ROLES.ADMIN && (
            <button className="flex items-center hover:text-[#1BDDF3] transition-colors duration-150" aria-label="Cart" onClick={() => setShowCart(true)}>
              <LiaShoppingCartSolid size={32} color={cartItems.length > 0 ? "#1BDDF3" : "currentColor"} />
              {cartItems.length > 0 ?
                <span className="flex items-center font-medium text-[#1BDDF3]">
                  <sup className="text-[14px]">{cartItems.length}</sup>
                </span>
                : null}
            </button>
          )}
          {isUserSignedIn ? (
            <button
              className="bg-[#F2EDE4] text-[#0A0A0B] rounded-full w-[30px] h-[30px] text-center font-semibold text-[16px] hover:bg-[#1BDDF3] duration-150"
              onClick={() => navigate("/profile")}>
              {getFirstAlphabetLetter(globalUsername)}
            </button>
          ) : (
            <button className="hover:text-[#1BDDF3] transition-colors duration-150" aria-label="User" onClick={() => setShowUserMenu(true)}>
              <FaRegUser size={22} />
            </button>
          )}
        </div>
      </div>
      <div
        className={`px-4 md:component-x-axis-padding flex w-full py-5 items-center text-[#F2EDE4] duration-300 border-b-[1px] border-b-[#F2EDE4]/10 border-t-transparent ${isNavbarBackgroundVisible
          ? "bg-[#0A0A0B]/70 backdrop-blur-md border-t-[1px] border-t-[#F2EDE4]/10"
          : "bg-transparent backdrop-blur-md"
          }`}
        data-testid="bottom-navbar"
        ref={bottomNavbarRef}>
        <button onClick={scrollToTop} className="flex items-center gap-2">
          <span className="bg-[#1BDDF3] w-4 h-4 lg:w-5 lg:h-5 block"></span>
          <span className="font-serif tracking-wide text-[#F2EDE4] md:text-2xl">WS</span>
        </button>
        <div className="flex w-full px-4 justify-end md:justify-center md:px-0">
          <div className="flex gap-2 md:gap-[8rem]">
            <NavLink
              viewTransition
              to={"/"}
              className={({ isActive }) => {
                return isActive ? "navbar-link-style border-b border-[#1BDDF3] text-[#F2EDE4]" : "navbar-link-style text-[#F2EDE4]/60 hover:text-[#F2EDE4]";
              }}>
              Home
            </NavLink>
            <NavLink
              viewTransition
              to={"/products"}
              className={({ isActive }) => {
                return isActive ? "navbar-link-style border-b border-[#1BDDF3] text-[#F2EDE4]" : "navbar-link-style text-[#F2EDE4]/60 hover:text-[#F2EDE4]";
              }}>
              Products
            </NavLink>
            <button className="navbar-link-style text-[#F2EDE4]/60 hover:text-[#F2EDE4]" onClick={handleGoToAboutUs}>
              About Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
