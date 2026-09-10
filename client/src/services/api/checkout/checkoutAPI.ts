import axios from "axios";
import { BACKEND_API_URL } from "../../../utils/constants";

export async function placeOrder(orderData: {
  userId: string;
  dropLocation: string;
  phoneNumber: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/checkout`, orderData);
    console.log(response);
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

export async function initiateCheckout(payload: {
  userId: string | null;
  dropLocation: string;
  phoneNumber: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/checkout/initiate`, payload);

    console.log(response);
    return response.data as {
      paymentUrl: string;
      pidx: string;
      orderId: number;
    };
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

export async function verifyCheckout(pidx: string) {
  try {
    const response = await axios.get(`${BACKEND_API_URL}/checkout/verify`, {
      params: { pidx },
    });

    console.log(response);
    return response.data as {
      status: string;
      orderId: number;
    };
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
