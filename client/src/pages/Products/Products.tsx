import * as React from "react";
import { getAllProducts } from "../../services/api/product/productAPI";
import { ProductDTO } from "../../types/productType";
import { useUserStore } from "../../store/userStore";
import UpdateProductForm from "../../components/ui/ProductForms/UpdateProductForm";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import { fetchErrorCatcher } from "../../utils/helpers";
import FetchStatusDisplay from "../../components/ui/FetchStatusDisplay/FetchStatusDisplay";
import { useNavbarStore } from "../../store/navbarStore";
import getLevenshteinDistance from "../../utils/algorithm";
import { useUIStore } from "../../store/uiStore";
import { useSortedList } from "../../hooks/useSortedList";
import { deleteProduct } from "../../services/api/admin/adminProductAPI";
import { ProductCard } from "./components/ProductCard";

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
    <div className="w-full text-center mt-20 bg-[#0A0A0B] py-20">
      <h1 className="text-[#F2EDE4] font-serif text-3xl md:text-4xl">No products found</h1>
    </div>
  )

  return (
    <FetchStatusDisplay isLoading={isLoading} error={error} isEmpty={!products && !isLoading} emptyMessage="No products available">
      <div className="text-[#F2EDE4] bg-[#0A0A0B] px-4 md:component-x-axis-padding py-8">
        <h1 className="text-center text-3xl md:text-4xl mb-8">Products</h1>

        <div className="flex items-center justify-center md:justify-end gap-3 pb-8">
          <label htmlFor="sort" className="text-[#F2EDE4]/60 text-sm md:text-base">
            Sort
          </label>
          <select
            id="sort"
            className="bg-transparent text-[#F2EDE4] border border-[#F2EDE4]/20 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#1BDDF3] [&>option]:bg-[#0A0A0B] [&>option]:text-[#F2EDE4]"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="priceLowHigh">Price, low to high</option>
            <option value="priceHighLow">Price, high to low</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              role={role}
              setShowUpdateProductForm={setShowUpdateProductForm}
              setSelectedProduct={setSelectedProduct}
              setShowConfirmModal={setShowConfirmModal}
              setProductToDelete={setProductToDelete}
            />
          ))}
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
