import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div
        className="flex flex-col md:flex-row gap-6 md:gap-0 md:justify-between md:items-center text-[#F2EDE4] border-t border-[#F2EDE4]/10 bg-[#0A0A0B] px-4 py-10 lg:pt-16 lg:pb-12 lg:component-x-axis-padding"
        data-testid="footer">
        <div className="flex items-center gap-2">
          <span className="bg-[#1BDDF3] w-3 h-3 block"></span>
          <h1 className="text-lg tracking-wide">Watch Store</h1>
        </div>
        <ul className="flex flex-col gap-3 md:gap-8 text-sm text-[#F2EDE4]/60 md:flex-row">
          <li className="hover:text-[#F2EDE4] transition-colors duration-150">
            <Link to={"/"}>Home</Link>
          </li>
          <li className="hover:text-[#F2EDE4] transition-colors duration-150">
            <Link to={"products"}>Products</Link>
          </li>
          <li className="hover:text-[#F2EDE4] transition-colors duration-150">
            <Link to={"https://github.com/Potassiumxx/watch-store"} target="_blank">Repository</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
