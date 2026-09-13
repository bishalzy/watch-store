import * as React from "react";
import ProfileContentContainer from "../container/ProfileContentContainer";
import { initialProductDirtyFieldState, validateProductFormStringFields, validateFileField } from "../../../utils/validateProductForm";
import { useProductStore } from "../../../store/productStore";
import useForm from "../../../hooks/useForm";
import { DirtyFieldState } from "../../../types/form";
import {
  ProductFormFields,
  ProductFormResponse,
  ProductFormStringFields,
  ProductStringFormValidationReturnType,
} from "../../../types/productType";
import { addProduct } from "../../../services/api/admin/adminProductAPI";
import ProductForm from "../../../components/ui/ProductForms/ProductForm";
import useProductForm from "../../../hooks/useProductForm";
import { useUIStore } from "../../../store/uiStore";

export default function AdminProductPage() {
  const { isValidationError, handleFieldOnChange, dirtyField, handleFormSubmit, generalError, setGeneralError } =
    useForm<DirtyFieldState<ProductFormFields>>(initialProductDirtyFieldState);
  const { handleFileUpload, validateProductFormFields, handleProductFieldOnChange } = useProductForm(useProductStore.getState());
  const isLoading = useUIStore((state) => state.isLoading);

  const {
    productName,
    productPrice,
    productCategory,
    productDescription,
    productQuantity,
    productImage,
    productStringErrorFields,
    productFileErrorFields,
    productFileName,
    setProductStringFormError,
    setProductFileFormError,
    clearProductStringFormError,
    clearProductFileFormError,
    clearProductFormFieldsValues
  } = useProductStore();

  const [message, setMessage] = React.useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = React.useState<number>(0);

  async function handleAddProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setGeneralError(null);

    if (validateProductFormFields({
      stringFields: {
        productName,
        productPrice,
        productCategory,
        productDescription,
        productQuantity
      },
      fileProperties: {
        file: productImage,
        fileName: productFileName,
      },
      setStringError: setProductStringFormError,
      setFileError: setProductFileFormError,
      isValidationError: isValidationError
    })) return;

    const response = await handleFormSubmit<ProductStringFormValidationReturnType, ProductFormResponse>({
      apiCall: () =>
        addProduct({ productName, productPrice, productCategory, productDescription, productQuantity, productImage }),
      setError: setProductStringFormError,
    });

    if (response) {
      setMessage("Product added successfully!");
      clearProductFormFieldsValues();
      setFileInputKey((k) => k + 1);
    }
  }


  React.useEffect(() => {
    clearProductStringFormError();
    clearProductFileFormError();
  }, [])

  return (
    <ProfileContentContainer title="Add Product">
      <div className="bg-[#111113] border border-[#F2EDE4]/10 rounded-sm px-4 md:px-10 lg:px-16 py-8 md:py-12 w-full md:w-auto mb-20">
        <ProductForm
          key={fileInputKey}
          onSubmit={handleAddProductSubmit}
          onChange={(e) => handleProductFieldOnChange<ProductFormStringFields>({
            event: e,
            values: {
              productName,
              productPrice,
              productCategory,
              productDescription,
              productQuantity
            },
            dirtyField: dirtyField,
            setStringError: setProductStringFormError,
            clearStringError: clearProductStringFormError,
            handleFieldOnChange: handleFieldOnChange,
            validateFunction: validateProductFormStringFields
          })}
          onFileChange={(e) => handleFileUpload({
            e,
            validateFileFieldFunc: validateFileField,
            setProductFormFileErrorFunc: setProductFileFormError,
            isValidationError: isValidationError
          })}
          values={{ productName, productPrice, productCategory, productDescription, productQuantity }}
          stringFieldError={productStringErrorFields}
          fileFieldError={productFileErrorFields}
          generalError={generalError}
          onSuccessMessage={message}
          isLoading={isLoading}
          isLoadingTextValue="Adding..."
        />
      </div>
    </ProfileContentContainer>
  );
}
