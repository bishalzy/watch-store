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
      <div className="flex w-full py-2 outerDivBackgroundColour text-white items-center px-4 justify-end md:px-[50px] md:justify-between">
        <div>
          <span className="text-[10px] italic capitalize text-[#898989] hidden xl:block md:w-[80%] xl:w-full">Buy best watches with free shipping & returns</span>
        </div>
        {openSearchBar && (
          <input
            onChange={(e) => setSearchedValue(e.target.value)}
            ref={searchBarRef}
            className={`${isSearchBarVisible ? "w-[50%] md:w-[65%] xl:w-[50%]" : "w-0 px-0"
              } h-6 text-black px-2 outline-1 transition-all duration-300 absolute right-[160px] md:right-[180px] lg:right-[260px] xl:right-[320px]`}
            placeholder="Search"
          />
        )}
        <div className="flex items-center w-[200px] justify-end gap-4 lg:justify-between">
          <button ref={searchIconRef} onClick={handleOpenSearchBar} className="hover:cursor-pointer" aria-label="Search">
            <IoSearchOutline size={25} />
          </button>
          <button className="flex items-center hover:cursor-pointer" aria-label="Cart" onClick={() => setShowCart(true)}>
            <LiaShoppingCartSolid size={32} color={cartItems.length > 0 ? "#e65100" : "white"} />
            {cartItems.length > 0 ?
              <span className="flex items-center font-bold">
                <sup className="text-[14px]">{cartItems.length}</sup>
              </span>
              : null}
          </button>
          {isUserSignedIn ? (
            <button
              className="bg-white text-black rounded-full w-[30px] h-[30px] text-center font-bold text-[19px] hover:bg-gray-500 hover:text-white duration-150"
              onClick={() => navigate("/profile")}>
              {getFirstAlphabetLetter(globalUsername)}
            </button>
          ) : (
            <button className="hover:cursor-pointer" aria-label="User" onClick={() => setShowUserMenu(true)}>
              <FaRegUser size={22} />
            </button>
          )}
        </div>
      </div>
      <div
        className={`px-4 md:component-x-axis-padding flex w-full py-5 items-center text-white duration-300 border-b-[1px] border-b-white/[.5] border-t-transparent ${isNavbarBackgroundVisible
          ? "bg-black/[.5] backdrop-blur-md border-t-[1px] border-t-white/[.5]"
          : "bg-transparent backdrop-blur-md"
          }`}
        data-testid="bottom-navbar"
        ref={bottomNavbarRef}>
        <button onClick={scrollToTop} className="flex items-center gap-2 hover:scale-110 duration-300">
          <span className="bg-[#1bddf3] w-4 h-4 lg:w-5 lg:h-5 block"></span>
          <span className="font-bold tracking-wider text-white md:text-2xl">WS</span>
        </button>
        <div className="flex w-full px-4 justify-end md:justify-center md:px-0">
          <div className="flex gap-2 md:gap-[8rem]">
            <NavLink
              to={"/"}
              className={({ isActive }) => {
                return isActive ? "navbar-link-style border-b-2 border-white" : "navbar-link-style";
              }}>
              Home
            </NavLink>
            <NavLink
              to={"/products"}
              className={({ isActive }) => {
                return isActive ? "navbar-link-style border-b-2 border-white" : "navbar-link-style";
              }}>
              Products
            </NavLink>
            <button className="navbar-link-style" onClick={handleGoToAboutUs}>
              About Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
