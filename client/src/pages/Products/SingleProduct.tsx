import * as React from "react";
import { useParams } from "react-router-dom";
import { ProductDTO } from "../../types/productType";
import { getProductByID } from "../../services/api/product/productAPI";
import { fetchErrorCatcher } from "../../utils/helpers";
import FetchStatusDisplay from "../../components/ui/FetchStatusDisplay/FetchStatusDisplay";
import Button from "../../components/ui/Button/Button";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";
import { ROLES } from "../../utils/constants";

export default function SingleProductPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [product, setProduct] = React.useState<ProductDTO | null>(null);

  const addToCart = useCartStore((state) => state.addToCart);

  const isUserSignedIn = useAuthStore((state) => state.isUserSignedIn);
  const setShowUserMenu = useUIStore((state) => state.setShowUserMenu);

  const role = useUserStore((state) => state.role);

  async function fetchProduct() {
    setIsLoading(true);
    try {
      const data = await getProductByID(Number(id));
      setProduct(data);
    } catch (error) {
      fetchErrorCatcher(error, setError);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchProduct();
  }, [id]);

  return (
    <FetchStatusDisplay isLoading={isLoading} isEmpty={!product && !isLoading} error={error} emptyMessage="Could not fetch product.">
      {product &&
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start text-[#F2EDE4] bg-[#0A0A0B] px-4 md:component-x-axis-padding py-8 md:py-14">
          <div className="w-[480px] aspect-square md:aspect-[4/5] rounded-sm flex items-center justify-center overflow-hidden">
            <img
              src={`http://localhost:5000/images/${product.imagePath}`}
              alt={product.name}
              className="w-full h-full object-contain p-6 md:p-10"
            />
          </div>

          <div className="flex flex-col gap-6 md:gap-8 max-w-full md:max-w-[500px] bg-[#111113] px-6 py-6 md:px-8 md:py-8 rounded-sm">
            <div>
              <h1 className="text-3xl md:text-5xl leading-tight truncate" title={product.name}>{product.name}</h1>
              <p className="text-sm md:text-base text-[#F2EDE4]/45 uppercase tracking-wide mt-2">{product.category}</p>
            </div>

            <div className="flex flex-col gap-2 border-t border-b border-[#F2EDE4]/10 py-4">
              <span className="flex justify-between text-[#F2EDE4]/45 items-center text-xs uppercase tracking-wide">
                <h4>Price</h4>
                <h4>Quantity</h4>
              </span>
              <span className="flex justify-between items-baseline">
                <p className="text-3xl md:text-4xl text-[#1BDDF3]">Rs. {product.price}</p>
                <span className="text-xl md:text-2xl font-medium">{product.quantity}</span>
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs uppercase tracking-wide text-[#F2EDE4]/45">Description</h4>
              <p className="text-sm md:text-base text-[#F2EDE4]/75 leading-relaxed max-h-[250px] overflow-y-auto pr-2">
                {product.description.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            </div>

            {role !== ROLES.ADMIN && (
              product.quantity > 0 ?
                <Button
                  textValue="Add to cart"
                  className="w-full h-[48px] bg-[#1BDDF3] text-[#0A0A0B] font-medium rounded-sm hover:bg-[#F2EDE4] transition-colors duration-150"
                  onClick={() => {
                    if (!isUserSignedIn) return setShowUserMenu(true);
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      availableStock: product.quantity,
                      quantity: 1,
                      category: product.category,
                      imagePath: product.imagePath,
                    })
                  }}
                /> : <div className="text-xl md:text-2xl text-center text-[#F2EDE4]/50 py-3">Out of stock</div>
            )}
          </div>
        </div>
      }
    </FetchStatusDisplay>
  );
}
