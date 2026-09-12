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

  function statusStyle(status: string) {
    if (status === "COMPLETED") return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (status === "FAILED") return "text-red-400 border-red-400/30 bg-red-400/10";
    return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  }

  return (
    <ProfileContentContainer title="View Orders" isLoading={isLoading}>
      <FetchStatusDisplay
        isLoading={isLoading}
        error={fetchError}
        isEmpty={orders.length === 0 && !isLoading}
        emptyMessage="No orders history to show">
        <div className="flex flex-col gap-6 w-full min-h-dvh text-[#F2EDE4] p-4 md:p-8">
          <div className="flex flex-col-reverse md:flex-row gap-3 items-stretch md:items-center justify-between">
            <input
              type="text"
              placeholder="Search by order, email, item, or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-transparent border border-[#F2EDE4]/20 rounded-sm text-sm text-[#F2EDE4] placeholder:text-[#F2EDE4]/35 focus:outline-none focus:border-[#1BDDF3] w-full md:w-[320px]"
            />
            <div className="flex items-center gap-2 justify-end">
              <label htmlFor="sort" className="text-[#F2EDE4]/60 text-sm">Sort</label>
              <select
                id="sort"
                className="bg-transparent text-[#F2EDE4] border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1BDDF3] [&>option]:bg-[#0A0A0B] [&>option]:text-[#F2EDE4]"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          <div className="bg-[#111113] border border-[#F2EDE4]/10 rounded-sm min-h-[420px] flex flex-col justify-between w-full overflow-x-auto">
            <table className="min-w-full table-auto md:table-fixed text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-[#F2EDE4]/45 border-b border-[#F2EDE4]/10">
                <tr>
                  <th className="p-3 font-normal">#</th>
                  <th className="p-3 font-normal">Order ID</th>
                  {role === ROLES.ADMIN && <th className="p-3 font-normal w-[300px]">User email</th>}
                  <th className="p-3 font-normal">Date</th>
                  <th className="p-3 font-normal">Time</th>
                  <th className="p-3 font-normal">Total</th>
                  <th className="p-3 font-normal">Status</th>
                  <th className="p-3 font-normal w-[160px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  paginatedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={role === ROLES.ADMIN ? 8 : 7} className="text-center py-20 text-[#F2EDE4]/40 font-serif text-2xl">
                        No orders found.
                      </td>
                    </tr>
                  ) :
                    paginatedOrders.map((order, index) => {
                      const totalPrice = order.orderItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
                      const isExpanded = expandedOrderId === order.orderID;
                      return (
                        <React.Fragment key={order.orderID}>
                          <tr className={`border-b border-[#F2EDE4]/10 ${isExpanded ? "bg-[#F2EDE4]/[0.03]" : ""}`}>
                            <td className="p-3 text-[#F2EDE4]/50">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td className="p-3">{order.orderID}</td>
                            {role === ROLES.ADMIN && <td className="p-3 overflow-x-auto text-[#F2EDE4]/70">{order.userEmail}</td>}
                            <td className="p-3 text-[#F2EDE4]/70">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 text-[#F2EDE4]/70">{new Date(order.createdAt).toLocaleTimeString()}</td>
                            <td className="p-3">Rs. {totalPrice}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-[11px] border ${statusStyle(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => toggleShowOrderItems(order.orderID)}
                                className="border border-[#F2EDE4]/20 rounded-sm px-3 py-1.5 text-xs text-[#F2EDE4]/70 hover:border-[#1BDDF3] hover:text-[#1BDDF3] transition-colors duration-150">
                                {isExpanded ? "Hide details" : "Show details"}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-[#F2EDE4]/[0.03] border-b border-[#F2EDE4]/10">
                              <td colSpan={role === ROLES.ADMIN ? totalColSpanValue : totalColSpanValue - 1} className="p-5 md:p-6">
                                <div className="grid md:grid-cols-[1.6fr_1fr] gap-6">
                                  <div>
                                    <h4 className="text-xs uppercase tracking-wide text-[#F2EDE4]/45 mb-3">Items</h4>
                                    <div className="border border-[#F2EDE4]/10 rounded-sm overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="text-left text-[11px] uppercase tracking-wide text-[#F2EDE4]/40 border-b border-[#F2EDE4]/10">
                                            <th className="font-normal py-2 px-3">Item</th>
                                            <th className="font-normal py-2 px-3 text-right">Qty</th>
                                            <th className="font-normal py-2 px-3 text-right">Unit</th>
                                            <th className="font-normal py-2 px-3 text-right">Line total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.orderItems.map((item) => (
                                            <tr key={item.productId} className="border-b border-[#F2EDE4]/5 last:border-b-0">
                                              <td className="py-2 px-3 text-[#F2EDE4]/85">{item.productName}</td>
                                              <td className="py-2 px-3 text-right text-[#F2EDE4]/60">{item.quantity}</td>
                                              <td className="py-2 px-3 text-right text-[#F2EDE4]/60">Rs. {item.unitPrice}</td>
                                              <td className="py-2 px-3 text-right text-[#F2EDE4]/85">Rs. {item.unitPrice * item.quantity}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                        <tfoot>
                                          <tr className="border-t border-[#F2EDE4]/10">
                                            <td colSpan={3} className="py-2 px-3 text-right text-xs uppercase tracking-wide text-[#F2EDE4]/45">Subtotal</td>
                                            <td className="py-2 px-3 text-right text-[#1BDDF3]">Rs. {totalPrice}</td>
                                          </tr>
                                        </tfoot>
                                      </table>
                                    </div>
                                  </div>

                                  <div className="border border-[#F2EDE4]/10 rounded-sm p-4 flex flex-col gap-3 h-fit">
                                    <h4 className="text-xs uppercase tracking-wide text-[#F2EDE4]/45">Delivery</h4>
                                    <div className="flex flex-col gap-2.5">
                                      <div>
                                        <p className="text-[11px] text-[#F2EDE4]/40">Phone number</p>
                                        <p className="text-sm text-[#F2EDE4]/85">{order.phoneNumber}</p>
                                      </div>
                                      <div>
                                        <p className="text-[11px] text-[#F2EDE4]/40">Drop location</p>
                                        <p className="text-sm text-[#F2EDE4]/85">{order.dropLocation}</p>
                                      </div>
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
            <div className="flex justify-center items-center py-4 gap-4">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-1.5 border border-[#F2EDE4]/20 rounded-sm text-xs text-[#F2EDE4]/70 hover:border-[#1BDDF3] hover:text-[#1BDDF3] disabled:opacity-30 disabled:hover:border-[#F2EDE4]/20 disabled:hover:text-[#F2EDE4]/70 transition-colors duration-150"
              >
                Previous
              </button>
              <span className="text-[#F2EDE4]/50 text-xs">Page {currentPage} of {totalPages <= 0 ? totalPages + 1 : totalPages}</span>
              <button
                disabled={currentPage === totalPages || totalPages <= 1}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-4 py-1.5 border border-[#F2EDE4]/20 rounded-sm text-xs text-[#F2EDE4]/70 hover:border-[#1BDDF3] hover:text-[#1BDDF3] disabled:opacity-30 disabled:hover:border-[#F2EDE4]/20 disabled:hover:text-[#F2EDE4]/70 transition-colors duration-150"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </FetchStatusDisplay>
    </ProfileContentContainer>
  )
}
