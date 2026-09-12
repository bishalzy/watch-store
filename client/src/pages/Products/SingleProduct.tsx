import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { ProductDTO, RecommendedProductDTO } from "../../types/productType";
import { getProductByID, getSimilarProducts } from "../../services/api/product/productAPI";
import { fetchErrorCatcher } from "../../utils/helpers";
import FetchStatusDisplay from "../../components/ui/FetchStatusDisplay/FetchStatusDisplay";
import Button from "../../components/ui/Button/Button";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";
import { ROLES } from "../../utils/constants";
import { getProductImageUrl } from "../../utils/imageUtil";
import { addRecentlyViewed } from "../../utils/recentViews";
import { IoSparkles } from "react-icons/io5";

export default function SingleProductPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [product, setProduct] = React.useState<ProductDTO | null>(null);
  const [similarProducts, setSimilarProducts] = React.useState<RecommendedProductDTO[]>([]);

  const addToCart = useCartStore((state) => state.addToCart);

  const isUserSignedIn = useAuthStore((state) => state.isUserSignedIn);
  const setShowUserMenu = useUIStore((state) => state.setShowUserMenu);

  const role = useUserStore((state) => state.role);

  async function fetchProduct() {
    setIsLoading(true);
    try {
      const productId = Number(id);
      const data = await getProductByID(productId);
      setProduct(data);
      addRecentlyViewed(productId);

      try {
        const similar = await getSimilarProducts(productId, 3);
        setSimilarProducts(similar);
      } catch (simErr) {
        console.error("Failed to load similar products:", simErr);
      }
    } catch (error) {
      fetchErrorCatcher(error, setError);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchProduct();
  }, [id]);

  console.log(product);

  return (
    <FetchStatusDisplay isLoading={isLoading} isEmpty={!product && !isLoading} error={error} emptyMessage="Could not fetch product.">
      {product && (
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start text-[#F2EDE4] bg-[#0A0A0B] px-4 md:component-x-axis-padding py-8 md:py-14">
            <div className="w-[480px] aspect-square md:aspect-[4/5] rounded-sm flex items-center justify-center overflow-hidden">
              <img
                src={getProductImageUrl(`http://localhost:5000/images/${product.imagePath}`)}
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
                product.quantity > 0 ? (
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
                      });
                    }}
                  />
                ) : (
                  <div className="text-xl md:text-2xl text-center text-[#F2EDE4]/50 py-3">Out of stock</div>
                )
              )}
            </div>
          </div>

          {/* Similar Watches Section */}
          {similarProducts.length > 0 && (
            <div className="px-4 md:component-x-axis-padding mt-4 pt-10 pb-10 border-t border-[#F2EDE4]/10 text-[#F2EDE4] bg-[#0A0A0B]">
              <div className="flex items-center gap-2 mb-6">
                <IoSparkles className="text-[#1BDDF3] text-xl" />
                <h2 className="text-2xl md:text-3xl">Similar watches you may like</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProducts.map((similar) => (
                  <Link to={`/product/${similar.id}`} key={similar.id}>
                    <div className="relative h-[380px] md:h-[460px] flex flex-col bg-[#111113] group border border-[#1BDDF3]/30 rounded-sm hover:border-[#1BDDF3] transition-colors duration-200">
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#1BDDF3]/15 text-[#1BDDF3] border border-[#1BDDF3]/30">
                        <IoSparkles size={12} /> {similar.matchPercentage} match
                      </div>
                      <div className="flex justify-between pt-4 px-4 items-start gap-2">
                        <div className="flex flex-col gap-1 min-w-0">
                          <h1 className="text-xl md:text-2xl truncate" title={similar.name}>{similar.name}</h1>
                          <h1 className="text-xs tracking-wide text-[#F2EDE4]/45 uppercase">{similar.category}</h1>
                        </div>
                      </div>
                      <img
                        className="h-[250px] md:h-[330px] object-contain w-full py-2 scale-90 group-hover:scale-[0.95] transition-transform duration-300 ease-out"
                        src={getProductImageUrl(similar.imagePath)}
                        alt={similar.name}
                      />
                      <div className="flex justify-between items-center px-4 pb-4 border-t border-[#F2EDE4]/10 pt-3">
                        <span className="flex gap-2 items-baseline">
                          <h3 className="text-[#F2EDE4]/45 text-xs">Qty</h3>
                          <h1 className="font-medium text-sm">{similar.quantity}</h1>
                        </span>
                        <h1 className="text-xl md:text-2xl text-[#1BDDF3]">Rs. {similar.price}</h1>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </FetchStatusDisplay>
  );
}
