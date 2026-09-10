interface OrderItemsDTO {
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
}

export interface OrderResponseDTO {
  orderID: number;
  userEmail?: string;
  phoneNumber: string;
  dropLocation: string;
  createdAt: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  orderItems: OrderItemsDTO[];
}
