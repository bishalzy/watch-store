import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import AboutUs from "../../components/ui/AboutUs/AboutUs";
import { useUIStore } from "../../store/uiStore";
import { GallerySection } from "./components/GallerySection";
import { WatchDialAnimation } from "./components/WatchDialAnimation";

export default function Home() {
  const location = useLocation();
  const navbarHeight = useUIStore((state) => state.navbarHeight);

  React.useEffect(() => {
    if (location.state?.scrollTo === "about-us") {
      const el = document.getElementById("about-us");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <>
      <div
        className="bg-[#0A0A0B] text-[#F2EDE4]"
        style={{ minHeight: `calc(85dvh - ${navbarHeight}px)` }}
      >
        <div className="flex flex-col-reverse xl:flex-row xl:items-center h-full max-w-[1200px] mx-auto px-4 md:component-x-axis-padding gap-10 xl:gap-4 pt-8 pb-14 xl:py-0">
          <div className="flex flex-col gap-6 xl:w-[55%]">
            <h1 className="text-4xl md:text-6xl xl:text-7xl leading-[1.05] tracking-tight">
              Time, worn
              <br />
              on your terms.
            </h1>
            <p className="text-[#F2EDE4]/70 text-base md:text-lg max-w-[440px] leading-relaxed">
              A considered collection of watches from everyday pieces to the ones you save for.
              Built to last, priced to actually wear.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 text-base md:text-lg"
              >
                <span className="border-b border-[#1BDDF3] pb-0.5 group-hover:border-[#F2EDE4] transition-colors duration-200">
                  View the collection
                </span>
              </Link>
            </div>
            <p className="text-sm text-[#F2EDE4]/45 pt-4">Free shipping. Returns within 3 days.</p>
          </div>

          <div className="flex justify-center xl:justify-end xl:w-[45%]">
            <WatchDialAnimation />
          </div>
        </div>
      </div>

      <GallerySection />
      <section>
        <AboutUs />
      </section>
    </>
  );
}
