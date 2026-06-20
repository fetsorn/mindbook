import { useLingui } from "@lingui/solid/macro";

export function FilterScroll() {
  const { t } = useLingui();
  // TODO only show after scrolling up, hide on scrolling down
  // TODO only show on desktop
  return <button onClick={() => window.scrollTo(0, 0)}>{t`scroll to top`}</button>;
}
