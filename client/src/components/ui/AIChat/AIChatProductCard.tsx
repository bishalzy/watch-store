import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ProductDTO } from "../../../types/productType";
import { useCartStore } from "../../../store/cartStore";
import { useAuthStore } from "../../../store/authStore";
import { useUIStore } from "../../../store/uiStore";
import { useUserStore } from "../../../store/userStore";
import { useChatStore } from "../../../store/chatStore";
import { IoCheckmark, IoCartOutline } from "react-icons/io5";
import { getProductImageUrl } from "../../../utils/imageUtil";
import { ROLES } from "../../../utils/constants";

interface AIChatProductCardProps {
  product: ProductDTO;
}

export default function AIChatProductCard({ product }: AIChatProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const isUserSignedIn = useAuthStore((state) => state.isUserSignedIn);
  const setShowUserMenu = useUIStore((state) => state.setShowUserMenu);
  const setIsOpen = useChatStore((state) => state.setIsOpen);
  const role = useUserStore((state) => state.role);

  const isOutOfStock = product.quantity <= 0;
  const isAdmin = role === ROLES.ADMIN;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUserSignedIn) {
      setShowUserMenu(true);
      return;
    }
    if (isOutOfStock) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      availableStock: product.quantity,
      quantity: 1,
      category: product.category,
      imagePath: product.imagePath,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-black border border-white/40 hover:border-white rounded-sm p-3 flex flex-col justify-between transition-all duration-200 shadow-md group">
      <Link
        to={`/product/${product.id}`}
        onClick={() => setIsOpen(false)}
        className="flex gap-3 items-center group-hover:opacity-95"
      >
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-sm p-1 flex items-center justify-center flex-shrink-0 border border-white/20 overflow-hidden">
          <img
            src={getProductImageUrl(product.imagePath)}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/favicon.png";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#c7c7c7] group-hover:text-[#1bddf3] transition-colors block">
            {product.category}
          </span>
          <h4 className="text-white text-sm font-bold truncate uppercase tracking-wide group-hover:text-[#1bddf3] transition-colors">
            {product.name}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-white font-extrabold text-sm">Rs. {product.price.toFixed(2)}</span>
            <span
              className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border font-semibold ${
                isOutOfStock
                  ? "border-red-600/60 text-red-400 bg-red-950/40"
                  : "border-emerald-600/60 text-emerald-400 bg-emerald-950/40"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex gap-2 mt-3 pt-2.5 border-t border-white/20">
        <Link
          to={`/product/${product.id}`}
          onClick={() => setIsOpen(false)}
          className={`text-center py-1.5 text-xs text-white border border-white/50 hover:bg-white hover:text-black rounded-sm transition-all font-semibold uppercase tracking-wider ${
            isAdmin ? "flex-1" : "flex-1"
          }`}
        >
          View Watch
        </Link>
        {!isAdmin && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdded}
            className={`px-3.5 py-1.5 text-xs rounded-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              isAdded
                ? "bg-emerald-600 text-white border border-emerald-500"
                : isOutOfStock
                ? "bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed"
                : "bg-[#1bddf3] text-black hover:bg-opacity-80 active:scale-95"
            }`}
            aria-label="Add watch to cart"
          >
            {isAdded ? (
              <>
                <IoCheckmark size={14} /> Added
              </>
            ) : (
              <>
                <IoCartOutline size={14} /> Add
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
