// @hugeicons/core-free-icons currently omits its declared dist/types files from
// the published package. Keep the icon array contract from @hugeicons/react.
declare module "@hugeicons/core-free-icons" {
  import type { IconSvgElement } from "@hugeicons/react";

  export const BeachIcon: IconSvgElement;
  export const BridgeIcon: IconSvgElement;
  export const CloudIcon: IconSvgElement;
  export const SunsetIcon: IconSvgElement;
  export const CheckmarkBadge01Icon: IconSvgElement;
  export const FingerPrintIcon: IconSvgElement;
}
