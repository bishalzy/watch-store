/**
 * Represents shape of product form fields that stores string values only.
 */
export interface ProductFormStringFields {
  productName: string;
  productPrice: string;
  productCategory: string;
  productDescription: string;
  productQuantity: string;
}

/**
 * Represents shape of product form fields that stores files only.
 */
export interface ProductFormFileField {
  productImage: File | null;
}

/**
 * Represents shape of product form fields and their validation error message's return type.
 *
 * If there's a validation error, this interface represents the error message's type, which is usually string .
 */

export type ProductStringFormValidationReturnType = Partial<ProductFormStringFields>;

export type ProductFileFormValidationReturnType = {
  productImage?: string;
};

export interface CategoryFormFields {
  newCategory: string;
}

export type ProductFormFields = ProductFormStringFields & ProductFormFileField & { productID?: string };

export interface ProductFormResponse {
  message: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  quantity: number;
  imagePath: string;
  isActive: boolean;
  dateAdded: string;
}

export interface CategoryDTO {
  id: number;
  categoryName: string;
  productCount: number;
}

export interface RecommendedProductDTO extends ProductDTO {
  matchScore: number;
  matchPercentage: string;
}

