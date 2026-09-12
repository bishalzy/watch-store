import Form from "../../../components/ui/Form/Form";
import FormFieldWrapper from "../../../components/ui/FormFieldWrapper/FormFieldWrapper";
import ProfileContentContainer from "../container/ProfileContentContainer";
import { useProductStore } from "../../../store/productStore";
import * as React from "react";
import Input from "../../../components/ui/Input/Input";
import Button from "../../../components/ui/Button/Button";
import { addNewCategory, deleteCategory, updateCategory } from "../../../services/api/admin/adminCategoryAPI";
import axios from "axios";
import { CategoryDTO } from "../../../types/productType";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import ConfirmModal from "../../../components/ui/ConfirmModal/ConfirmModal";
import { getAllProductCategories } from "../../../services/api/category/categoryAPI";
import FetchStatusDisplay from "../../../components/ui/FetchStatusDisplay/FetchStatusDisplay";

export default function AdminProductCategory() {
  const newCategory = useProductStore((state) => state.newCategory);
  const setNewCategory = useProductStore((state) => state.setNewCategory);

  const [error, setError] = React.useState<string | undefined>("");
  const [fetchCategoriesError, setFetchCategoriesError] = React.useState<string | null>(null);
  const [updateError, setUpdateError] = React.useState<{ [categoryID: number]: string } | null>({});

  const [message, setMessage] = React.useState<string | null>(null);

  const [categories, setCategories] = React.useState<CategoryDTO[]>([]);
  const [categoryToDelete, setCategoryToDelete] = React.useState({
    id: 0,
    categoryName: "",
  })
  const [editingCategoryID, setEditingCategoryID] = React.useState<number | null>(null);
  const [editedCategoryName, setEditedCategoryName] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState<boolean>(false);
  const [hasCategoryUpdated, setHasCategoryUpdated] = React.useState<boolean>(false);

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newCategory === "") return setError("Product category cannot be empty");

    if (message) setMessage(null);

    try {
      await addNewCategory(newCategory);
      setMessage("Product category added.");
      setHasCategoryUpdated(true);
      setError("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data;
        if (backendMessage) {
          setError(backendMessage);
        } else {
          setError("Something went wrong.");
        }
      } else {
        console.log("Unexpected error:", error);
        setError("Unexpected error occurred.");
      }
    }
  }

  async function handleCategoryUpdate(categoryID: number) {
    if (editedCategoryName === "") {
      setUpdateError(prev => ({
        ...prev,
        [categoryID]: "Category name cannot be empty",
      }));
      return;
    }

    try {
      await updateCategory(categoryID, editedCategoryName);
      setUpdateError(prev => {
        const newErrors = { ...prev };
        delete newErrors[categoryID];
        return newErrors;
      })
      setHasCategoryUpdated(true);
      setEditingCategoryID(null);
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data;
        console.log(backendMessage);
        setUpdateError(prev => ({ ...prev, [categoryID]: backendMessage || "Something went wrong" }));
      } else {
        console.log("Unexpected error:", error);
        setUpdateError(prev => ({ ...prev, [categoryID]: "Unexpected error occured." }));
      }
    }
  }

  async function handleCategoryDelete(categoryID: number) {
    try {
      const response = await deleteCategory(categoryID);
      setHasCategoryUpdated(true);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchCategories() {
    setIsLoading(true);
    setFetchCategoriesError(null);

    try {
      const data = await getAllProductCategories();
      setCategories(data);
    } catch (error) {
      if (error instanceof Error) setFetchCategoriesError(error.message);
      else setFetchCategoriesError("Unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }


  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (message) setMessage(null);
    const value = e.target.value;

    if (error && value !== "") setError("");
    if (value === "") setError("Product Category cannot be empty");

    setNewCategory(value);
  }

  React.useEffect(() => {
    fetchCategories();
    setHasCategoryUpdated(false);
  }, [hasCategoryUpdated])

  return (
    <ProfileContentContainer title="Product Category">
      <div className="flex flex-col gap-14 w-full md:w-auto p-4 md:p-8">
        <div className="bg-[#111113] border border-[#F2EDE4]/10 rounded-sm px-4 md:px-16 py-8">
          <h2 className="text-2xl text-white text-center mb-6">Add new category</h2>
          <Form handleFormSubmit={handleCategorySubmit}>
            <FormFieldWrapper
              label="Category name"
              id="add-product-category"
              useVerticalLabelErrorStyle={true}
              error={error}
              positionRow={true}
              onSuccessMessage={message}
            >
              <Input
                id="add-product-category"
                name="newProductCategory"
                placeholder="Digital Watch"
                value={newCategory}
                onChange={handleOnChange}
                error={error}
                className="bg-transparent border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#1BDDF3]"
              />
            </FormFieldWrapper>
            <Button
              textValue="Submit"
              className="w-full md:w-[200px] self-center mt-5 py-2.5 bg-[#1BDDF3] text-[#0A0A0B] font-medium rounded-sm hover:bg-[#F2EDE4] transition-colors duration-150"
            />
          </Form>
        </div>

        <div className="bg-[#111113] border border-[#F2EDE4]/10 rounded-sm py-8 mb-10">
          <h2 className="text-white text-2xl text-center mb-6">Categories</h2>
          <FetchStatusDisplay
            isLoading={isLoading}
            error={fetchCategoriesError}
            isEmpty={categories.length === 0}
            emptyMessage="No categories found"
            loadingIconSize={30}>
            <ul className="md:w-full px-4 md:px-10 space-y-2">
              {categories.map((category) => {
                const isCategoryInUse: boolean = category.productCount > 0;
                const inEditMode = editingCategoryID === category.id;
                return (
                  <li
                    key={category.id}
                    className="text-white flex items-center justify-between border border-[#F2EDE4]/10 rounded-sm px-3 md:px-6 py-3 md:py-4 hover:border-[#F2EDE4]/25 transition-colors duration-150"
                  >
                    {
                      inEditMode ? (
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 w-full">
                          <div className={`${updateError ? "flex flex-col gap-1" : "flex"}`}>
                            <input
                              value={editedCategoryName}
                              autoFocus
                              onChange={(e) => {
                                setEditedCategoryName(e.target.value);
                                if (updateError && e.target.value !== "") setUpdateError(null);
                                if (e.target.value === "") setUpdateError({ [category.id]: "Category name cannot be empty" });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  setEditingCategoryID(null);
                                  setUpdateError(null);
                                }
                                else if (e.key === "Enter") handleCategoryUpdate(category.id);
                              }}
                              className={`outline-none px-1 py-1 bg-transparent text-[#F2EDE4] text-sm border-b
                                ${updateError?.[category.id] ? "border-red-500" : "border-[#F2EDE4]/30 focus:border-[#1BDDF3]"}`}
                            />
                            {updateError?.[category.id] && <span className="text-red-400 text-xs mt-1">{updateError[category.id]}</span>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCategoryUpdate(category.id)}
                              className="text-xs border border-[#1BDDF3] text-[#1BDDF3] px-3 py-1 rounded-sm hover:bg-[#1BDDF3] hover:text-[#0A0A0B] transition-colors duration-150">
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategoryID(null);
                                setUpdateError(null);
                              }}
                              className="text-xs border border-[#F2EDE4]/20 text-[#F2EDE4]/70 px-3 py-1 rounded-sm hover:border-[#F2EDE4]/40 hover:text-[#F2EDE4] transition-colors duration-150">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) :
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base">{category.categoryName}</span>
                          <span className="text-[#F2EDE4]/40 text-xs mt-0.5">{category.productCount} product{category.productCount === 1 ? "" : "s"} using this</span>
                        </div>
                    }

                    <div className="flex gap-1">
                      {!inEditMode &&
                        <button
                          onClick={() => {
                            setEditingCategoryID(category.id);
                            setEditedCategoryName(category.categoryName);
                            setUpdateError(null);
                          }}
                          className="p-2 rounded-sm text-lg text-[#F2EDE4]/50 hover:text-[#1BDDF3] hover:bg-[#1BDDF3]/10 transition-colors duration-150">
                          <CiEdit />
                        </button>
                      }
                      <button
                        onClick={() => {
                          if (!isCategoryInUse) {
                            setShowConfirmModal(true);
                            setCategoryToDelete(category);
                            setUpdateError(null);
                          }
                        }}
                        title={isCategoryInUse ? "Remove all products from this category first" : undefined}
                        className={`p-2 rounded-sm text-lg transition-colors duration-150
                        ${isCategoryInUse ? "cursor-not-allowed text-[#F2EDE4]/20" : "text-[#F2EDE4]/50 hover:text-red-400 hover:bg-red-400/10"}`
                        }>
                        <MdDeleteOutline />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </FetchStatusDisplay>
        </div>

        {
          showConfirmModal &&
          <ConfirmModal
            isOpen={true}
            message={`Are you sure you want to delete "${categoryToDelete.categoryName}"?`}
            onConfirm={() => {
              handleCategoryDelete(categoryToDelete.id);
              setShowConfirmModal(false);
            }}
            onCancel={() => {
              setShowConfirmModal(false);
              setCategoryToDelete({ id: 0, categoryName: "" });
            }}
          />
        }
      </div>
    </ProfileContentContainer>
  )
}
