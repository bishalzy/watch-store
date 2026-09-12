import axios from "axios";
import { BACKEND_API_URL } from "../../../utils/constants";
import { ProductDTO, RecommendedProductDTO } from "../../../types/productType";

export async function getAllProducts(): Promise<ProductDTO[]> {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/products`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
      throw error;
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }
}

export async function getProductByID(productID: number): Promise<ProductDTO> {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/products/${productID}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
      throw error;
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }
}

export async function getPersonalizedRecommendations(
  viewedIds: number[] = [],
  limit: number = 3
): Promise<RecommendedProductDTO[]> {
  try {
    const params = new URLSearchParams();
    if (viewedIds.length > 0) {
      params.append("viewedIds", viewedIds.join(","));
    }
    params.append("limit", limit.toString());

    const response = await axios.get(`${BACKEND_API_URL}/products/recommendations?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error fetching recommendations:", error.response?.data);
    } else {
      console.error("Unexpected error fetching recommendations:", error);
    }
    return [];
  }
}

export async function getSimilarProducts(
  productID: number,
  limit: number = 3
): Promise<RecommendedProductDTO[]> {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/products/${productID}/similar?limit=${limit}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error fetching similar products:", error.response?.data);
    } else {
      console.error("Unexpected error fetching similar products:", error);
    }
    return [];
  }
}

