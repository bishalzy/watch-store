import { NavLink } from "react-router-dom";
import { useUserStore } from "../../../store/userStore";
import { ROLES } from "../../../utils/constants";

export default function UserProfileMenu() {
  const role = useUserStore((state) => state.role);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "w-full text-center py-3 text-[#F2EDE4] border-b-2 md:border-b-0 md:border-l-2 border-[#1BDDF3] transition-colors duration-150"
      : "w-full text-center py-3 text-[#F2EDE4]/50 border-b-2 md:border-b-0 md:border-l-2 border-transparent hover:text-[#F2EDE4] transition-colors duration-150";

  return (
    <div className="flex w-full md:w-[240px] bg-[#111113] border-b md:border-b-0 md:border-r border-[#F2EDE4]/10">
      <div className="flex md:flex-col w-full items-center text-[13px] md:pt-6">
        <NavLink to={"."} end className={linkClass}>
          My Account
        </NavLink>
        <NavLink to={"orders"} end className={linkClass}>
          View Orders
        </NavLink>
        {role === ROLES.ADMIN && (
          <>
            <NavLink to={"add-product"} className={linkClass}>
              Add Product
            </NavLink>
            <NavLink to={"product-category"} className={linkClass}>
              Manage Categories
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
}
