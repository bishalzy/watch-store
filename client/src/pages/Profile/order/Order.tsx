import * as React from "react";
import ProfileContentContainer from "../container/ProfileContentContainer";
import { getSpecificOrder } from "../../../services/api/order/orderAPI";
import { OrderResponseDTO } from "../../../types/orderType";
import { useUserStore } from "../../../store/userStore";
import { ROLES } from "../../../utils/constants";
import { useAuthStore } from "../../../store/authStore";
import { useSortedList } from "../../../hooks/useSortedList";
import getLevenshteinDistance from "../../../utils/algorithm";
import { getAllOrders } from "../../../services/api/admin/adminOrderAPI";
import FetchStatusDisplay from "../../../components/ui/FetchStatusDisplay/FetchStatusDisplay";

export default function Order() {
  const [orders, setOrders] = React.useState<OrderResponseDTO[]>([]);
  const [expandedOrderId, setExpandedOrderId] = React.useState<number | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortOption, setSortOption] = React.useState<string>("az");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const itemsPerPage = 5;
  const totalColSpanValue = 8;

  function getFuzzyFilteredOrders(orders: OrderResponseDTO[], searchQuery: string) {
    if (!searchQuery.trim()) return orders;

    const normalizedSearch = searchQuery.toLowerCase().replace(/\s+/g, "");

    return orders.filter((order) => {
      const normalizedOrderID = order.orderID.toString().toLowerCase();
      const normalizedUserEmail = order.userEmail?.toLowerCase() || "";
      const normalizedDropLocation = order.dropLocation.toLowerCase();
      const normalizedPhoneNumber = order.phoneNumber.toLowerCase();

      // Check direct includes first
      if (
        normalizedOrderID.includes(normalizedSearch) ||
        normalizedUserEmail.includes(normalizedSearch) ||
        normalizedDropLocation.includes(normalizedSearch) ||
        normalizedPhoneNumber.includes(normalizedSearch) ||
        order.orderItems.some(item =>
          item.productName?.toLowerCase().includes(normalizedSearch)
        )
      ) {
        return true;
      }

      const fieldsToCheck = [
        normalizedOrderID,
        normalizedUserEmail,
        normalizedDropLocation,
        normalizedPhoneNumber,
        ...order.orderItems.map(item => item.productName?.toLowerCase() || "")
      ];

      return fieldsToCheck.some(field => {
        const distance = getLevenshteinDistance(normalizedSearch, field);
        const threshold = Math.floor(field.length * 0.8);
        return distance <= threshold;
      });
    });
  }

  const filteredOrders = React.useMemo(() => getFuzzyFilteredOrders(orders, searchQuery), [orders, searchQuery]);

  const sortedOrders = useSortedList<OrderResponseDTO>(filteredOrders, sortOption, {
    newest: "createdAt",
    oldest: "createdAt",
  })

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const { role, userID } = useUserStore();

  const isJWTChecked = useAuthStore((state) => state.isJWTChecked);


  function toggleShowOrderItems(orderId: number) {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  }

  async function fetchAllOrders() {
    setIsLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.log(error);
      setFetchError("Error occured while fetching orders");
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchSpecificOrder() {
    setIsLoading(true);
    try {
      const data = await getSpecificOrder(userID);
      setOrders(data);
      console.log(data);
    } catch (error) {
      console.log(error);
      setFetchError("Error occured while fetching orders");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    if (!isJWTChecked) return;

    if (role === ROLES.ADMIN) fetchAllOrders();
    else fetchSpecificOrder();

  }, [isJWTChecked]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <ProfileContentContainer title="View Orders" isLoading={isLoading}>
      <FetchStatusDisplay
        isLoading={isLoading}
        error={fetchError}
        isEmpty={orders.length === 0 && !isLoading}
        emptyMessage="No orders history to show">
        <div className="flex flex-col gap-4 md:gap-10 w-full min-h-dvh">
          <div className="flex flex-col-reverse md:flex-row gap-4 h-10 items-center mt-8 md:mt-0">
            <div className="flex items-center justify-center md:justify-end gap-2">
              <label htmlFor="sort" className="text-white font-semibold md:text-2xl">
                Sort:
              </label>
              <select
                id="sort"
                className="bg-white text-black rounded-md px-1 md:px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2 lg:px-4 py-2 border rounded w-full text-black"
            />
          </div>
          <div className="innerDivBackgroundColour border border-white/[.5] pb-4 rounded-md shadow-lg shadow-black min-h-[420px] flex flex-col justify-between w-full overflow-x-auto px-2">
            <table className="text-white min-w-full table-auto md:table-fixed text-sm md:text-base">
              <thead className="text-left text-[15px] text-bold bg-white/[.2] text-sm md:text-base">
                <tr className="p-4">
                  <th className="p-2">#</th>
                  <th className="p-2">Order ID</th>
                  {role === ROLES.ADMIN && <th className="p-2 w-[400px]">User Email</th>}
                  <th className="p-2">Date (D/M/Y)</th>
                  <th className="p-2">Time (24h)</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 w-[200px]">Action</th>
                </tr>
              </thead>
              <tbody className="text-left">
                {
                  paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={role === ROLES.ADMIN ? 7 : 6} className="text-center py-20 text-4xl">
                        No orders found.
                      </td>
                    </tr>
                  ) :
                    paginatedOrders.map((order, index) => {
                      const totalPrice = order.orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
                      return (
                        <React.Fragment key={order.orderID}>
                          <tr className="border-b border-gray-400">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{order.orderID}</td>
                            {role === ROLES.ADMIN && <td className="p-2 overflow-x-auto">{order.userEmail}</td>}
                            <td className="p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="p-2">{new Date(order.createdAt).toLocaleTimeString()}</td>
                            <td className="p-2">{totalPrice}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.status === "COMPLETED" ? "bg-green-600" :
                                order.status === "FAILED" ? "bg-red-600" :
                                "bg-yellow-600"
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-2">
                              <button
                                onClick={() => toggleShowOrderItems(order.orderID)}
                                className="border px-2 text-sm md:text-base md:px-4 md:py-2 hover:bg-white hover:text-black duration-200">
                                {expandedOrderId === order.orderID ? " Hide Details" : "Show Details"}
                              </button>
                            </td>
                          </tr>
                          {expandedOrderId === order.orderID && (
                            <tr>
                              <td colSpan={role === ROLES.ADMIN ? totalColSpanValue : totalColSpanValue - 1} className="p-4">
                                <div className="grid grid-cols-[2fr_1fr] border-b">
                                  <div className="">
                                    <strong>Items:</strong>
                                    <ul className="list-dash list-inside pl-4 mt-1">
                                      {order.orderItems.map((item) => (
                                        <li key={item.productId}>
                                          {item.productName} | Quantity: {item.quantity} | Price: {item.unitPrice}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="flex flex-col gap-8 ml-auto">
                                    <div className="mb-2">
                                      <strong>Phone Number:</strong> {order.phoneNumber}
                                    </div>
                                    <div className="mb-2">
                                      <strong>Drop Location:</strong> {order.dropLocation}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    }
                    )
                }
              </tbody>
            </table>
            <div className="flex justify-center items-center mt-4 gap-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 border text-white rounded hover:bg-white hover:text-black disabled:opacity-50 duration-200"
              >
                Previous
              </button>
              <span className="text-white">Page {currentPage} of {totalPages <= 0 ? totalPages + 1 : totalPages}</span>
              <button
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-4 py-2 border text-white rounded hover:bg-white hover:text-black disabled:opacity-50 duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </FetchStatusDisplay>
    </ProfileContentContainer >
  )
}
