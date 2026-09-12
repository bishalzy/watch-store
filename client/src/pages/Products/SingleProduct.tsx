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

  return (
    <FetchStatusDisplay isLoading={isLoading} isEmpty={!product && !isLoading} error={error} emptyMessage="Could not fetch product.">
      {product && (
        <div className="flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
            <img
              src={getProductImageUrl(product.imagePath)}
              alt={product.name}
              className="w-[600px] rounded-lg shadow-lg"
            />
            <div className="flex flex-col px-4 py-4 gap-4 md:pl-8 max-w-full md:max-w-[500px]">
              <div>
                <h1 className="text-3xl md:text-5xl font-semibold md:mb-4 md:w-full overflow-style">{product.name}</h1>
                <p className="text-[14px] md:text-2xl text-gray-300 mb-2 max-w-full overflow-style">{product.category}</p>
              </div>
              <div className="flex flex-col md:gap-2">
                <span className="flex justify-between text-gray-300 items-center uppercase">
                  <h4 className="text-[14px] md:text-[16px]">Price</h4>
                  <h4 className="text-[14px] md:text-[16px]">Quantity</h4>
                </span>
                <span className="flex justify-between items-center">
                  <p className="text-3xl md:text-4xl font-semibold max-w-[180px] overflow-style">Rs. {product.price}</p>
                  <span className="text-2xl md:text-3xl font-semibold text-left max-w-[80px] overflow-style">{product.quantity}</span>
                </span>
              </div>
              <span className="flex flex-col gap-4 border-b-2">
                <h4 className="uppercase text-gray-300 text-[14px] md:text-[16px]">Description</h4>
                <p className="text-base mb-4 max-h-[250px] max-w-full overflow-y-auto border px-2 md:border-none">
                  {product.description.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </span>
              {role !== ROLES.ADMIN && (
                product.quantity > 0 ? (
                  <Button
                    textValue="Add to cart"
                    className="defaultButtonStyle w-full bg-orange-700 hover:bg-orange-600 hover:text-white"
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
                  <div className="text-3xl font-semibold text-center">Out of stock</div>
                )
              )}
            </div>
          </div>

          {/* Similar Watches Section */}
          {similarProducts.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-800 text-white">
              <div className="flex items-center gap-2 mb-6">
                <IoSparkles className="text-[#1bddf3] text-2xl animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
                  Similar Watches You May Like
                </h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                {similarProducts.map((similar) => (
                  <Link to={`/product/${similar.id}`} key={similar.id}>
                    <div className="relative h-[400px] md:h-[500px] flex flex-col innerDivBackgroundColour group border-[1px] border-[#1bddf3]/40 rounded-md hover:border-[#1bddf3] transition-all duration-300 shadow-[0_0_18px_rgba(27,221,243,0.1)]">
                      <div className="absolute top-3 right-3 z-10">
                        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1bddf3]/15 text-[#1bddf3] border border-[#1bddf3]/40 backdrop-blur-sm shadow-sm">
                          <IoSparkles size={12} /> {similar.matchPercentage} Match
                        </span>
                      </div>
                      <div className="flex justify-between pt-4 px-4 items-center">
                        <div className="flex flex-col gap-1">
                          <h1 className="font-black text-2xl md:text-3xl whitespace-nowrap overflow-x-auto max-w-[200px]">
                            {similar.name}
                          </h1>
                          <h1 className="font-semibold text-sm tracking-wide text-[#c7c7c7]">{similar.category}</h1>
                        </div>
                      </div>
                      <img
                        className="h-[280px] md:h-[370px] object-contain w-full py-2 scale-90 group-hover:scale-105 transition-transform duration-200"
                        src={getProductImageUrl(similar.imagePath)}
                        alt={similar.name}
                      />
                      <div className="flex justify-between align-middle items-center px-4">
                        <span className="flex gap-2 items-center">
                          <h3 className="text-[#c7c7c7] text-sm">Quantity</h3>
                          <h1 className="font-semibold text-lg max-w-[50px] overflow-x-auto">{similar.quantity}</h1>
                        </span>
                        <h1 className="font-bold text-2xl md:text-3xl max-w-[140px] overflow-x-auto whitespace-nowrap">
                          Rs. {similar.price}
                        </h1>
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


