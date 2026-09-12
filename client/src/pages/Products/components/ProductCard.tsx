import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";
import { ROLES } from "../../../utils/constants";
import { ProductDTO } from "../../../types/productType";
import { getProductImageUrl } from "../../../utils/imageUtil";
import { IoSparkles } from "react-icons/io5";

type ProductCardProps = {
  product: ProductDTO;
  role: string;
  isRecommended?: boolean;
  matchPercentage?: string;
  setShowUpdateProductForm: (show: boolean) => void;
  setSelectedProduct: (product: ProductDTO) => void;
  setShowConfirmModal: (show: boolean) => void;
  setProductToDelete: (product: { id: number; name: string }) => void;
};

export function ProductCard({
  product,
  role,
  isRecommended = false,
  matchPercentage,
  setShowUpdateProductForm,
  setSelectedProduct,
  setShowConfirmModal,
  setProductToDelete,
}: ProductCardProps) {
  return (
    <div className="flex flex-col" key={product.id}>
      {role === ROLES.ADMIN &&
        <div className="flex gap-5 justify-end pb-2">
          <div className="after:block after:bg-[#F2EDE4]/40 after:w-[1px] after:h-2 after:items-center after:mx-auto hover:after:w-[3px] hover:after:bg-[#1BDDF3]">
            <Button
              textValue="Edit"
              className="h-[32px] w-[56px] items-center text-xs text-[#F2EDE4]/70 border border-[#F2EDE4]/25 rounded-sm hover:border-[#1BDDF3] hover:text-[#1BDDF3] transition-colors duration-150"
              onClick={() => {
                setShowUpdateProductForm(true);
                setSelectedProduct(product);
              }}
            />
          </div>

          <div className="after:flex after:bg-[#F2EDE4]/40 after:w-[1px] after:h-2 after:justify-center after:items-center after:mx-auto hover:after:w-[3px] hover:after:bg-red-500">
            <Button
              textValue="Delete"
              className="h-[32px] w-[64px] items-center text-xs text-[#F2EDE4]/70 border border-[#F2EDE4]/25 rounded-sm hover:border-red-500 hover:text-red-500 transition-colors duration-150"
              onClick={() => {
                setShowConfirmModal(true);
                setProductToDelete({
                  id: product.id,
                  name: product.name,
                });
              }}
            />
          </div>
        </div>
      }

      <Link to={`/product/${product.id}`}>
        <div
          className={`relative h-[380px] md:h-[460px] flex flex-col bg-[#111113] group border rounded-sm transition-colors duration-200 ${
            isRecommended
              ? "border-[#1BDDF3]/30 hover:border-[#1BDDF3]"
              : "border-[#F2EDE4]/10 hover:border-[#F2EDE4]/30"
          }`}
        >
          {isRecommended && matchPercentage && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#1BDDF3]/15 text-[#1BDDF3] border border-[#1BDDF3]/30">
              <IoSparkles size={12} /> {matchPercentage} match
            </div>
          )}

          <div className="flex justify-between pt-4 px-4 items-start gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              <h1
                className="text-xl md:text-2xl truncate"
                title={product.name}
              >
                {product.name}
              </h1>

              <h1 className="text-xs tracking-wide text-[#F2EDE4]/45 uppercase">
                {product.category}
              </h1>
            </div>
          </div>

          <img
            className="h-[250px] md:h-[330px] object-contain w-full py-2 scale-90 group-hover:scale-[0.95] transition-transform duration-300 ease-out"
            src={getProductImageUrl(`http://localhost:5000/images/${product.imagePath}`)}
            alt={product.name}
          />

          <div className="flex justify-between items-center px-4 pb-4 border-t border-[#F2EDE4]/10 pt-3">
            <span className="flex gap-2 items-baseline">
              <h3 className="text-[#F2EDE4]/45 text-xs">Qty</h3>
              <h1 className="font-medium text-sm">{product.quantity}</h1>
            </span>

            <h1 className="font-serif text-xl md:text-2xl text-[#1BDDF3]">
              Rs. {product.price}
            </h1>
          </div>
        </div>
      </Link>
    </div>
  );
}
