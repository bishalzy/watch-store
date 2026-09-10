import { CheckoutFormFields } from "../types/cartAndCheckoutType";
import { isEmpty } from "./helpers";

const phoneRegex = /^[0-9]{7,15}$/;
// const cardRegex = /^[0-9]{16}$/;
// const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
// const cvvRegex = /^[0-9]{3,4}$/;

export function validateCheckoutForm({
  dropLocation,
  phoneNumber,
  // cardNumber,
  // expiry,
  // cvv,
}: CheckoutFormFields): Partial<CheckoutFormFields> {
  const errors: Partial<CheckoutFormFields> = {};

  if (isEmpty(dropLocation)) errors.dropLocation = "Drop location cannot be empty";

  // PHONE NUMBER: must be digits only, 7–15 characters
  if (isEmpty(phoneNumber)) {
    errors.phoneNumber = "Phone number cannot be empty";
  } else if (!phoneRegex.test(phoneNumber)) {
    errors.phoneNumber = "Enter a valid phone number";
  }

  // CARD NUMBER: must be 16 digits (ignoring spaces)
  // const cleanCardNumber = cardNumber?.replace(/\s+/g, "");
  // if (isEmpty(cardNumber)) {
  //   errors.cardNumber = "Card number cannot be empty";
  // } else if (!cardRegex.test(cleanCardNumber || "")) {
  //   errors.cardNumber = "Enter a valid 16-digit card number";
  // }

  // EXPIRY: MM/YY, valid month and not in the past
  // if (isEmpty(expiry)) {
  //   errors.expiry = "Expiry date cannot be empty";
  // } else if (!expiryRegex.test(expiry)) {
  //   errors.expiry = "Enter expiry in MM/YY format";
  // } else {
  //   const [monthStr, yearStr] = expiry.split("/");
  //   const month = parseInt(monthStr);
  //   const year = parseInt("20" + yearStr); // Convert YY to 20YY
  //
  //   const now = new Date();
  //   const expiryDate = new Date(year, month - 1, 1);
  //
  //   if (expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
  //     errors.expiry = "Card has expired";
  //   }
  // }

  // CVV: 3 or 4 digits
  // if (isEmpty(cvv)) {
  //   errors.cvv = "CVV cannot be empty";
  // } else if (!cvvRegex.test(cvv)) {
  //   errors.cvv = "Enter a valid 3 or 4-digit CVV";
  // }

  return errors;
}
