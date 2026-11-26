import { renderToStaticMarkup } from "react-dom/server";
import CheckoutPage from "../../src/app/checkout/page";

export function renderCheckout(): string {
  return renderToStaticMarkup(<CheckoutPage />);
}
