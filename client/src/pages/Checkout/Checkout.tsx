import * as React from "react";
import Button from "../../components/ui/Button/Button";
import Form from "../../components/ui/Form/Form";
import FormFieldWrapper from "../../components/ui/FormFieldWrapper/FormFieldWrapper";
import Input from "../../components/ui/Input/Input";
import { useCheckoutStore } from "../../store/checkoutStore"
import { validateCheckoutForm } from "../../utils/validateCheckoutForm";
import { CheckoutFormFields } from "../../types/cartAndCheckoutType";
import useForm from "../../hooks/useForm";
import { useCartStore } from "../../store/cartStore";
import { initiateCheckout } from "../../services/api/checkout/checkoutAPI";
import { useUserStore } from "../../store/userStore";
import { getProductImageUrl } from "../../utils/imageUtil";

export default function Checkout() {
  // const navigate = useNavigate()

  const {
    checkoutItems,
    dropLocation,
    phoneNumber,
    // cardNumber,
    // cvv,
    // expiry,
    checkoutFormErrorFields,
    setCheckoutItems,
    clearCheckoutFormError,
    setCardNumber,
    setCheckoutFormError,
    setCvv,
    setDropLocation,
    setExpiry,
    setPhoneNumber,
  } = useCheckoutStore();

  const { cartItems } = useCartStore();

  const { userID } = useUserStore();

  const [checkoutAPIError, setCheckoutAPIError] = React.useState<string | null>(null);

  const formValueSetterMap: Record<keyof CheckoutFormFields, (val: string) => void> = {
    dropLocation: setDropLocation,
    phoneNumber: setPhoneNumber,
    cardNumber: (val) => setCardNumber(formatCardNumber(val)),
    expiry: setExpiry,
    cvv: setCvv,
  };

  const initialDirtyFieldState = {
    dropLocation: false,
    phoneNumber: false,
    cardNumber: false,
    cvv: false,
    expiry: false,
  }

  const { dirtyField, handleFieldOnChange, isValidationError, handleFormSubmit, generalError } = useForm(initialDirtyFieldState);

  const totalAmount: number = checkoutItems.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);

  function formatCardNumber(value: string) {
    return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  }

  async function handleCheckoutFormSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validateCheckoutForm({
      dropLocation,
      phoneNumber,
      // cardNumber,
      // cvv,
      // expiry
    })

    if (isValidationError(validationError, setCheckoutFormError)) return;
    clearCheckoutFormError();


    const transformedItems = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      unitPrice: item.price
    }));

    const response = await handleFormSubmit<CheckoutFormFields, { paymentUrl: string; pidx: string; orderId: number }>({
      apiCall: () => initiateCheckout({ userId: userID, dropLocation, phoneNumber, items: transformedItems }),
      setError: setCheckoutAPIError
    })

    if (response) {
      window.location.href = response.paymentUrl;
    }

    console.log(response);
  }

  function handleCheckoutFieldOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value, name } = event.target;
    const key = name as keyof CheckoutFormFields;
    const formValueSetter = formValueSetterMap[key]
    if (!formValueSetter) return;

    handleFieldOnChange<CheckoutFormFields>({
      fieldKey: key,
      newValue: value,
      allFormValues: {
        dropLocation,
        phoneNumber,
        // cardNumber,
        // expiry,
        // cvv
      },
      formValueSetter,
      validateFunction: validateCheckoutForm,
      setFieldErrorFunction: setCheckoutFormError,
      clearErrorsFunction: clearCheckoutFormError,
      dirtyField,
    });
  };

  React.useEffect(() => {
    setCheckoutItems(cartItems);
    if (checkoutFormErrorFields)
      clearCheckoutFormError();
  }, [cartItems])

  if (checkoutItems.length === 0) return (
    <div className="text-[#F2EDE4]/60 font-serif text-2xl md:text-3xl mx-auto text-center mt-24 bg-[#0A0A0B] min-h-[60dvh] w-full flex items-center justify-center">
      No items to checkout
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-4 py-4 md:py-10 text-[#F2EDE4] min-h-full">
      <div className="px-4 md:component-x-axis-padding">
        <h1 className="font-serif text-2xl md:text-3xl">{checkoutItems.length > 1 ? "Your items" : "Your item"}</h1>
        <div className="flex flex-col gap-8">
          <div className="pt-8 max-h-[500px] overflow-y-auto flex flex-col gap-4"> {
            checkoutItems.map((item) => {
              return (
                <div className="flex gap-4 pb-4 border-b border-[#F2EDE4]/10 last:border-b-0" key={item.id}>
                  <div className="w-[100px] h-[100px] bg-[#111113] rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={getProductImageUrl(item.imagePath)}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex justify-between w-full min-w-0">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="truncate" title={item.name}>{item.name}</span>
                      <span className="text-xs text-[#F2EDE4]/45">Qty <span className="text-[#F2EDE4]/80">{item.quantity}</span></span>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 pl-2">
                      <span className="text-[#1BDDF3]">Rs. {item.price * item.quantity}</span>
                      {item.quantity > 1 && <span className="text-xs text-[#F2EDE4]/40">Rs. {item.price} each</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between items-baseline pt-6 border-t border-[#F2EDE4]/10">
            <span className="text-lg text-[#F2EDE4]/70">Total</span>
            <div className="font-serif text-2xl text-[#1BDDF3]">Rs. {totalAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <div className="px-4 md:px-8 md:component-x-axis-padding rounded-sm mt-8 md:mt-0 py-6 bg-[#111113] border border-[#F2EDE4]/10">
        <h1 className="font-serif text-2xl md:text-3xl">Shipping information</h1>
        <div className="py-4 flex flex-col justify-between h-full">
          <Form className="flex flex-col p-0 justify-between h-full gap-6" handleFormSubmit={handleCheckoutFormSubmit}>
            <div className="flex flex-col gap-4">
              <FormFieldWrapper
                id="drop-location"
                label="Drop location"
                error={checkoutFormErrorFields.dropLocation}
                labelClassName="flex w-full whitespace-nowrap text-xs uppercase tracking-wide text-[#F2EDE4]/45"
              >
                <Input
                  id="drop-location"
                  name="dropLocation"
                  error={checkoutFormErrorFields.dropLocation}
                  placeholder="Enter pickup location. Be as precise as possible"
                  onChange={handleCheckoutFieldOnChange}
                  className="w-full bg-transparent border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#1BDDF3]"
                />
              </FormFieldWrapper>
              <FormFieldWrapper
                id="phone-number"
                label="Phone number"
                error={checkoutFormErrorFields.phoneNumber}
                labelClassName="flex w-full whitespace-nowrap text-xs uppercase tracking-wide text-[#F2EDE4]/45"
              >
                <Input
                  id="phone-number"
                  name="phoneNumber"
                  error={checkoutFormErrorFields.phoneNumber}
                  type="tel"
                  onChange={handleCheckoutFieldOnChange}
                  className="w-full bg-transparent border border-[#F2EDE4]/20 rounded-sm px-3 py-2 text-[#F2EDE4] placeholder:text-[#F2EDE4]/30 focus:outline-none focus:border-[#1BDDF3]"
                />
              </FormFieldWrapper>
              {/*
              <FormFieldWrapper
                id="card-number"
                label="Card Number"
                error={checkoutFormErrorFields.cardNumber}
                labelClassName="flex w-full whitespace-nowrap"
              >
                <Input
                  id="card-number"
                  name="cardNumber"
                  error={checkoutFormErrorFields.cardNumber}
                  placeholder="1234 1234 1234 1234"
                  inputMode="numeric"
                  pattern="\d"
                  maxLength={19}  // 16 digits + 3 spaces
                  onChange={handleCheckoutFieldOnChange}
                  value={cardNumber}
                />
              </FormFieldWrapper>
              <div className="flex gap-4 flex-col md:flex-row">
                <FormFieldWrapper
                  id="expiry"
                  label="Expiry"
                  error={checkoutFormErrorFields.expiry}
                  labelClassName="flex w-full whitespace-nowrap"
                >
                  <Input
                    id="expiry"
                    name="expiry"
                    error={checkoutFormErrorFields.expiry}
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    onChange={handleCheckoutFieldOnChange}
                  />
                </FormFieldWrapper>

                <FormFieldWrapper
                  id="cvv"
                  label="CVV"
                  error={checkoutFormErrorFields.cvv}
                  labelClassName="flex w-full whitespace-nowrap"
                >
                  <Input
                    id="cvv"
                    name="cvv"
                    error={checkoutFormErrorFields.cvv}
                    type="tel"
                    inputMode="numeric"
                    pattern="/d{3,4}"
                    maxLength={4}
                    placeholder="CVV/CVC"
                    onChange={handleCheckoutFieldOnChange}
                  />
                </FormFieldWrapper>
              </div>
                */}
            </div>

            {(generalError || checkoutAPIError) && (
              <div className="text-red-400 text-sm text-center">
                {generalError ?? checkoutAPIError}
              </div>
            )}

            <Button
              textValue={`Pay Rs. ${totalAmount.toFixed(2)}`}
              className="w-full h-[46px] bg-[#1BDDF3] text-[#0A0A0B] font-medium rounded-sm hover:bg-[#F2EDE4] transition-colors duration-150"
            />
          </Form>
        </div>
      </div>
    </div>
  )
}
