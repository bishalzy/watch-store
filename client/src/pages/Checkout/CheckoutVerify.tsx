import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyCheckout } from "../../services/api/checkout/checkoutAPI";
import { useCartStore } from "../../store/cartStore";
import { useCheckoutStore } from "../../store/checkoutStore";
import * as React from "react";

export default function CheckoutVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { clearCheckoutFormValues } = useCheckoutStore();
  const [state, setState] = React.useState<"verifying" | "success" | "failed">("verifying");

  React.useEffect(() => {
    const pidx = searchParams.get("pidx");
    if (!pidx) {
      setState("failed");
      return;
    }

    verifyCheckout(pidx)
      .then(() => {
        setState("success");
        clearCart();
        clearCheckoutFormValues();
        setTimeout(() => navigate("/checkout-success"), 1000);
      })
      .catch(() => setState("failed"));
  }, [searchParams]);

  if (state === "verifying") return <div className="text-white text-center mt-20">Confirming your payment...</div>;
  if (state === "failed") return <div className="text-white text-center mt-20">Payment failed or was canceled.</div>;
  return <div className="text-white text-center mt-20">Payment confirmed - redirecting...</div>;
}
