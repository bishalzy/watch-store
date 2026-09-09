import * as React from "react";
import { getAllProducts } from "../../services/api/product/productAPI";
import { ProductDTO } from "../../types/productType";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button/Button";
import { useUserStore } from "../../store/userStore";
import { ROLES } from "../../utils/constants";
import UpdateProductForm from "../../components/ui/ProductForms/UpdateProductForm";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import { fetchErrorCatcher } from "../../utils/helpers";
import FetchStatusDisplay from "../../components/ui/FetchStatusDisplay/FetchStatusDisplay";
import { useNavbarStore } from "../../store/navbarStore";
import getLevenshteinDistance from "../../utils/algorithm";
import { useUIStore } from "../../store/uiStore";
import { useSortedList } from "../../hooks/useSortedList";
import { deleteProduct } from "../../services/api/admin/adminProductAPI";

export default function Products() {
  const [products, setProducts] = React.useState<ProductDTO[]>([]);
  const [showConfirmModal, setShowConfirmModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setIsError] = React.useState<string | null>(null);
  const [sortOption, setSortOption] = React.useState<string>("az");
  const [productToDelete, setProductToDelete] = React.useState({
    id: 0,
    name: ""
  });

  const [selectedProduct, setSelectedProduct] = React.useState<ProductDTO>({
    id: 0,
    name: "",
    price: 0,
    category: "",
    description: "",
    quantity: 0,
    imagePath: "null",
    isActive: true,
    dateAdded: ""
  });

  const role = useUserStore((state) => state.role);


  const searchedValue = useNavbarStore((state) => state.searchedValue);

  const showUpdateProductForm = useUIStore((state) => state.showUpdateProductForm);
  const setShowUpdateProductForm = useUIStore((state) => state.setShowUpdateProductForm);

  const filteredProducts = getSearchedProducts(searchedValue);

  const sortedProducts = useSortedList<ProductDTO>(filteredProducts, sortOption, {
    az: "name",
    za: "name",
    priceLowHigh: "price",
    priceHighLow: "price",
    newest: "dateAdded",
    oldest: "dateAdded",
  })

  function getSearchedProducts(searchedString: string) {
    if (!searchedString.trim()) return products;

    const normalisedSearch = searchedString.toLowerCase().replace(/\s+/g, "");

    return products.filter((product) => {
      const normalisedProductName = product.name.toLowerCase().replace(/\s+/g, "");
      const normalisedCategory = product.category.toLowerCase().replace(/\s+/g, "");

      if (normalisedProductName.includes(normalisedSearch) || normalisedCategory.includes(normalisedSearch)) return true;

      const nameDistance = getLevenshteinDistance(normalisedSearch, normalisedProductName);
      const categoryDistance = getLevenshteinDistance(normalisedSearch, normalisedCategory);

      const nameThresold = Math.floor(normalisedProductName.length * 0.9);
      const categoryThresold = Math.floor(normalisedCategory.length * 0.8);

      return nameDistance <= nameThresold || categoryDistance <= categoryThresold;
    }).sort((a, b) => {
      const aIncludes = a.name.toLowerCase().includes(searchedString.toLowerCase()) ||
        a.category.toLowerCase().includes(searchedString.toLowerCase())
        ? 0 : 1;
      const bIncludes = b.name.toLowerCase().includes(searchedString.toLowerCase()) ||
        b.category.toLowerCase().includes(searchedString.toLowerCase())
        ? 0 : 1;
      if (aIncludes !== bIncludes) return aIncludes - bIncludes;

      const aDistName = getLevenshteinDistance(
        normalisedSearch,
        a.name.toLowerCase().replace(/\s+/g, "")
      );
      const aDistCategory = getLevenshteinDistance(
        normalisedSearch,
        a.category.toLowerCase().replace(/\s+/g, "")
      );
      const aDist = Math.min(aDistName, aDistCategory);

      const bDistName = getLevenshteinDistance(
        normalisedSearch,
        b.name.toLowerCase().replace(/\s+/g, "")
      );
      const bDistCategory = getLevenshteinDistance(
        normalisedSearch,
        b.category.toLowerCase().replace(/\s+/g, "")
      );
      const bDist = Math.min(bDistName, bDistCategory);

      return aDist - bDist;
    })
  }

  async function fetchProducts() {
    setIsLoading(true);
    setIsError(null);
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      fetchErrorCatcher(error, setIsError);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProductDelete(productID: number) {
    try {
      const response = await deleteProduct(productID);
      console.log(response);
      fetchProducts();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  React.useEffect(() => {
    fetchProducts();
  }, [])

  React.useEffect(() => {
    if (showUpdateProductForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showUpdateProductForm]);

  if (products.length === 0 && !isLoading || sortedProducts.length === 0 && !isLoading) return (
    <div className="w-full text-center mt-20">
      <h1 className="text-white text-4xl font-semibold">No products found</h1>
    </div>
  )

  return (
    <FetchStatusDisplay isLoading={isLoading} error={error} isEmpty={!products && !isLoading} emptyMessage="No products available">
      <div className="text-white px-4 md:component-x-axis-padding">
        <h1 className="text-center text-3xl font-bold mb-6">Products</h1>

        <div className="flex items-center justify-center md:justify-end gap-2 pb-8">
          <label htmlFor="sort" className="text-white font-semibold md:text-2xl">
            Sort:
          </label>
          <select
            id="sort"
            className="bg-white text-black rounded-md px-1 md:px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="priceLowHigh">Price: Low-High</option>
            <option value="priceHighLow">Price: High-Low</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {
            sortedProducts.map((product) => (
              <div
                className="flex flex-col"
                key={product.id}
              >
                {role === ROLES.ADMIN &&
                  <div className="flex gap-5 justify-end">
                    <div className="after:block after:bg-white after:w-[1px] after:h-2 after:items-center after:mx-auto hover:after:w-[3px]">
                      <Button textValue="Edit"
                        className="defaultButtonStyle h-[35px] w-[60px] items-center"
                        onClick={() => {
                          setShowUpdateProductForm(true);
                          setSelectedProduct(product);
                        }} />
                    </div>
                    <div className="after:flex after:bg-white after:w-[1px] after:h-2 after:justify-center after:items-center after:mx-auto hover:after:w-[3px]">
                      <Button textValue="Delete"
                        className="defaultButtonStyle h-[35px] w-[70px] items-center bg-red-600 hover:bg-red-800 hover:text-white"
                        onClick={() => {
                          setShowConfirmModal(true);
                          setProductToDelete({ id: product.id, name: product.name });
                        }}
                      />
                    </div>
                  </div>
                }
                <Link to={`/product/${product.id}`}>
                  <div
                    className={`h-[400px] md:h-[500px] flex flex-col innerDivBackgroundColour group border-[1px] border-white/[.5] rounded-md hover:border-white`}>
                    <div className="flex justify-between pt-4 px-4 items-center">
                      <div className="flex flex-col gap-1">
                        <h1 className="font-black text-2xl md:text-3xl whitespace-nowrap overflow-x-auto max-w-[200px]">{product.name}</h1>
                        <h1 className="font-semibold text-sm tracking-wide text-[#c7c7c7]">{product.category}</h1>
                      </div>
                    </div>
                    <img
                      className="h-[280px] md:h-[370px] object-contain w-full py-2 scale-90 group-hover:scale-105 transition-transform duration-200"
                      src={`http://localhost:5000/images/${product.imagePath}`}
                      alt={product.name}
                    />

                    <div className="flex justify-between align-middle items-center px-4">
                      <span className="flex gap-2 items-center">
                        <h3 className="text-[#c7c7c7] text-sm">Quantity</h3>
                        <h1 className="font-semibold text-lg max-w-[50px] overflow-x-auto">{product.quantity}</h1>
                      </span>
                      <h1 className="font-bold text-2xl md:text-3xl max-w-[140px] overflow-x-auto whitespace-nowrap">Rs. {product.price}</h1>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          }
        </div>
        {
          showUpdateProductForm && (
            <UpdateProductForm
              selectedProduct={selectedProduct}
              fetchProductFunc={fetchProducts}
            />
          )
        }

        {
          showConfirmModal && (
            <ConfirmModal
              isOpen={true}
              message={`Are you sure you want to delete "${productToDelete.name}"?`}
              onConfirm={() => {
                handleProductDelete(productToDelete.id);
                setShowConfirmModal(false);
              }}
              onCancel={() => {
                setShowConfirmModal(false)
                setProductToDelete({ id: 0, name: "" });
              }}
            />
          )
        }
      </div>
    </FetchStatusDisplay >
  );
}
