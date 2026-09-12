/** @type {import('tailwindcss').Config} */

import plugin from "tailwindcss/plugin";

function customClassName({ addComponents }) {
  const newComponents = {
    ".component-x-axis-padding": {
      "@apply pr-[50px] pl-[50px]": {},
    },
    ".navbar-link-style": {
      "@apply text-right md:text-center border-white md:uppercase font-semibold md:tracking-wider": {},
    },
    ".navbar-link-style:hover": {
      "@apply border-t-2 border-t-white duration-100 ease-in-out": {},
    },
    ".navbar-link-padding": {
      "@apply px-[50px] py-[10px]": {},
    },
    ".backgroundImageStyle::before": {
      content: "''",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: "url(./src/assets/images/pexels-thefstopper-1075189.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100%",
      zIndex: -1,
      opacity: ".5",
    },
    ".formButtonStyle": {
      "@apply w-full py-2 bg-[#1bddf3] text-black rounded border-none hover:bg-opacity-80 hover:text-black": {},
    },
    ".defaultButtonStyle": {
      "@apply w-[150px] text-white border-2 border-white rounded-sm hover:font-bold hover:bg-white hover:text-black": {},
    },
    ".outerDivBackgroundColour": {
      "@apply bg-[#1a1a1a]": {},
    },
    ".innerDivBackgroundColour": {
      "@apply bg-black/[.95]": {},
    },
    ".formElementDefaultStyling": {
      "@apply bg-black/[0.5] w-full text-white p-2 border-2 border-white/[0.5] duration-200 disabled:cursor-not-allowed focus:border-[#1bddf3]/[0.7] focus:outline-none focus:ring-0":
        {},
    },
    ".formElementErrorStyling": {
      "@apply border-2 border-red-800 focus:border-red-600": {},
    },
  };
  addComponents(newComponents);
}

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Libre Caslon Text", "Georgia", "serif"],
      },
    },
  },
  plugins: [plugin(customClassName)],
};
