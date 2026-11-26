import { createElement } from "react";
export default function Image({ src, alt, fill, sizes, ...rest }) {
  return createElement("img", { src, alt: alt ?? "", ...rest });
}
