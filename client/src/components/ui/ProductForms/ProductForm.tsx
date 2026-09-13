import * as React from "react";
import { ProductFileFormValidationReturnType, ProductFormStringFields, ProductStringFormValidationReturnType } from "../../../types/productType";
import Button from "../Button/Button";
import { ErrorMessage } from "../Error/ErrorMessage";
import Form from "../Form/Form";
import FormFieldWrapper from "../FormFieldWrapper/FormFieldWrapper";
import Input from "../Input/Input";
import SelectField from "../Input/SelectField/SelectField";
import SuccessMessage from "../SuccessMessage/SuccessMessage";
import Textarea from "../Textarea/Textarea";

interface ProductFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  stringFieldError: ProductStringFormValidationReturnType;
  fileFieldError: ProductFileFormValidationReturnType;
  values: ProductFormStringFields;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generalError?: string | null;
  buttonTextValue?: string
  onSuccessMessage?: string | null;
  isLoading: boolean;
  isLoadingTextValue?: string;
}

export default function ProductForm({
  onSubmit,
  onChange,
  onFileChange,
  values,
  stringFieldError,
  fileFieldError,
  generalError,
  onSuccessMessage,
  buttonTextValue = "Submit",
    isLoading,
  isLoadingTextValue,
}: ProductFormProps) {
  return (
    <Form handleFormSubmit={onSubmit} className="flex flex-col gap-6 md:gap-8 relative py-4">
      <FormFieldWrapper
        label="Product name"
        id="product-name"
        useVerticalLabelErrorStyle={true}
        error={stringFieldError.productName}
        positionRow={true}
      >
        <Input
          id="product-name"
          name="productName"
          placeholder="Rolex"
          value={values.productName}
          onChange={(e) => onChange(e)}
          error={stringFieldError.productName}
          className="bg-transparent border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#1BDDF3]"
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Product price"
        id="product-price"
        useVerticalLabelErrorStyle={true}
        error={stringFieldError.productPrice}
        positionRow={true}>
        <Input
          id="product-price"
          name="productPrice"
          placeholder="199"
          type="number"
          value={values.productPrice}
          onChange={(e) => onChange(e)}
          error={stringFieldError.productPrice}
          className="bg-transparent border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#1BDDF3]"
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Product category"
        id="product-category"
        useVerticalLabelErrorStyle={true}
        error={stringFieldError.productCategory}
        positionRow={true}>
        <SelectField
          id="product-category"
          name="productCategory"
          aria-placeholder="Digital Watch"
          value={values.productCategory}
          onChange={(e) => onChange(e)}
          error={stringFieldError.productCategory}
          className="bg-[#0A0A0B] border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] focus:outline-none focus:border-[#1BDDF3]"
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Product description"
        id="product-description"
        useVerticalLabelErrorStyle={true}
        error={stringFieldError.productDescription}
        positionRow={true}>
        <Textarea
          id="product-description"
          name="productDescription"
          placeholder="Description of the product"
          value={values.productDescription}
          onChange={(e) => onChange(e)}
          error={stringFieldError.productDescription}
          className="w-full bg-transparent border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#1BDDF3] min-h-[120px]"
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Product quantity"
        id="product-quantity"
        useVerticalLabelErrorStyle={true}
        error={stringFieldError.productQuantity}
        positionRow={true}>
        <Input
          id="product-quantity"
          name="productQuantity"
          placeholder="Quantity"
          type="number"
          value={values.productQuantity}
          onChange={(e) => onChange(e)}
          error={stringFieldError.productQuantity}
          className="bg-transparent border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#1BDDF3]"
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Upload product image"
        id="product-image"
        useVerticalLabelErrorStyle={true}
        error={fileFieldError.productImage}
        isInputTypeFile={true}
        labelClassName="w-full"
        errorStyleClass="text-center">
        <Input
          id="product-image"
          name="productImage"
          placeholder="Upload product image"
          type="file"
          onChange={onFileChange}
          error={fileFieldError.productImage}
          className="w-full text-sm text-[#F2EDE4]/60 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-[#F2EDE4]/20 file:bg-transparent file:text-[#F2EDE4]/70 file:text-sm hover:file:border-[#1BDDF3] hover:file:text-[#1BDDF3] file:transition-colors file:duration-150"
        />
      </FormFieldWrapper>

      {generalError && <ErrorMessage message={generalError} className="absolute -top-6 left-0 right-0 text-center" />}
      {onSuccessMessage && <SuccessMessage message={onSuccessMessage} />}

      <Button
        className="w-full md:w-[240px] self-center mt-2 py-2.5 bg-[#1BDDF3] text-[#0A0A0B] font-medium rounded-sm hover:bg-[#F2EDE4] transition-colors duration-150"
        textValue={isLoading ? isLoadingTextValue : buttonTextValue}
      />
    </Form>
  )
}
