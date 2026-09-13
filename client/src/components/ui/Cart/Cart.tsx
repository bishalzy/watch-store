import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../../store/cartStore";
import Button from "../Button/Button";
import SidePanelContainer from "../SidePanel/SidePanelContainer";
import { MdDeleteOutline } from "react-icons/md";
import * as React from "react";
import { getProductImageUrl } from "../../../utils/imageUtil";

export function Cart() {
  const [closeSidePanel, setCloseSidePanel] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const { cartItems, removeFromCart, updateQuantity } = useCartStore();

  function handleCheckout() {
    navigate("/checkout");
    setCloseSidePanel(true);
  }

  return (
    <>
      <SidePanelContainer
        panelTitle={`${cartItems.length > 1 ? "Items" : "Item"} - ${cartItems.length}`}
        className="w-[520px] flex flex-col bg-[#0A0A0B] text-[#F2EDE4]"
        closeSidePanel={closeSidePanel}
      >
        {cartItems.length === 0 ? (
          <div className="m-auto h-full flex flex-col justify-center items-center gap-3">
            <h1 className="font-serif text-2xl text-[#F2EDE4]/80">Your cart is empty</h1>
            <p className="text-sm text-[#F2EDE4]/45">Items you add will show up here.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              {
                cartItems.map((item) => {
                  return (
                    <div className="flex gap-4 px-4 py-4 border-b border-[#F2EDE4]/10" key={item.id}>
                      <div className="w-[110px] h-[110px] md:w-[130px] md:h-[130px] bg-[#111113] rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img
                          src={getProductImageUrl(item.imagePath)}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr] w-full gap-2">
                        <div className="flex flex-col h-full justify-between min-w-0">
                          <div>
                            <h1 className="text-base md:text-lg truncate" title={item.name}>{item.name}</h1>
                            <span className="text-[#F2EDE4]/45 text-xs uppercase tracking-wide">{item.category}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-lg md:text-xl text-[#1BDDF3]">Rs. {item.price * item.quantity}</span>
                            <span className="text-xs text-[#F2EDE4]/40">Rs. {item.price} per unit</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#F2EDE4]/40 hover:text-red-400 transition-colors duration-150 text-lg">
                            <MdDeleteOutline />
                          </button>

                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center border border-[#F2EDE4]/15 rounded-sm h-8">
                              <button
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateQuantity(item.id, item.quantity - 1);
                                  }
                                }}
                                className="w-7 h-full text-[#F2EDE4]/60 hover:text-[#1BDDF3] transition-colors duration-150 text-sm">-</button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                className="w-9 text-center bg-transparent outline-none text-sm"
                                onChange={(e) => {
                                  const quantityValue = parseInt(e.target.value);
                                  if (!isNaN(quantityValue) && quantityValue > 0 && quantityValue <= item.availableStock) {
                                    updateQuantity(item.id, parseInt(e.target.value))
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  if (item.quantity < item.availableStock) {
                                    updateQuantity(item.id, item.quantity + 1);
                                  }
                                }}
                                className="w-7 h-full text-[#F2EDE4]/60 hover:text-[#1BDDF3] transition-colors duration-150 text-sm">+</button>
                            </div>
                            <span className="text-[11px] text-[#F2EDE4]/35">{item.availableStock - item.quantity} left</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
            <div className="p-4 border-t border-[#F2EDE4]/10 bg-[#0A0A0B] h-[76px] flex items-center">
              <Button
                textValue="Checkout"
                className="w-full h-[44px] bg-[#1BDDF3] text-[#0A0A0B] font-medium rounded-sm hover:bg-[#F2EDE4] transition-colors duration-150"
                onClick={handleCheckout}
              />
            </div>
          </div>
        )}
      </SidePanelContainer>
    </>
  )
}
