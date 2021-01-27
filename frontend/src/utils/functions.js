export const isBrowser = () => typeof window !== "undefined"
export const urlSearchParams = () =>
  new URLSearchParams(isBrowser() ? window.location.search : ``)
