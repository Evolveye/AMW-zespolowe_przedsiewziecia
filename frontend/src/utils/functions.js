import ERRORS from "./errorList.js"

export const isBrowser = () => typeof window !== "undefined"
export const urlSearchParams = () =>
  new URLSearchParams(isBrowser() ? window.location.search : ``)

export function getDate(format = ``, date = Date.now()) {
  if (typeof date != `number`) date = new Date(date)

  const options = {
    year: `numeric`,
    month: "2-digit",
    day: "2-digit",
    hour: `2-digit`,
    minute: `2-digit`,
  }
  const [
    { value: DD },
    ,
    { value: MM },
    ,
    { value: YYYY },
    ,
    { value: hh },
    ,
    { value: mm },
  ] = new Intl.DateTimeFormat(`pl`, options).formatToParts(date)

  return format
    .replace(/YYYY/, YYYY)
    .replace(/YY/, YYYY.slice(-2))
    .replace(/MM/, MM)
    .replace(/DD/, DD)
    .replace(/hh/, hh)
    .replace(/mm/, mm)
}

export function translateRole(roleName, defaultValue = ` = nieznana = `) {
  switch (roleName) {
    case `owner`:
      return `Właściciel`
    case `lecturer`:
      return `Prowadzący`
    case `student`:
      return `Student`

    default:
      return defaultValue
  }
}
/**
 * @param {RequestInfo} url
 * @param {RequestInit} init
 */
export function fetchWithStatusProcessing( url, init ) {
  return fetch(url, init)
    .then(res => {
      if (400 <= res.status && res.status < 500) {
        console.info(
          ` ^-- this error is %c ok %c. Real errors can apear later.`,
          `background-color:green; font-weight:bold;`,
          ``
        )
      }

      return res.json()
    })
}

/**
 * @param {object} param0
 * @param {RequestInfo} param0.url
 * @param {RequestInit} param0.init
 * @param {boolean} param0.runOnlyCbWhenUpdate
 * @param {(res:any) => void} param0.cb
 */
export function memoizedFetch({
  url,
  init = {},
  runOnlyCbWhenUpdate = true,
  cb,
}) {
  if (!isBrowser()) return

  const cached = sessionStorage.getItem(url)

  if (!cb) return JSON.parse(cached)
  if (!runOnlyCbWhenUpdate && cached) cb(JSON.parse(cached))
  if (init.body && [`object`, `array`].includes(typeof init.body))
    init.body = JSON.stringify(init.body)

  fetchWithStatusProcessing(url, init)
    .then(data => {
      if (data.error) {
        const { code, error } = data

        if (ERRORS[code] === undefined) console.error(error)

        return
      }

      const stringifiedData = JSON.stringify(data)

      if (cached === stringifiedData) return

      sessionStorage.setItem(url, stringifiedData)

      cb(data)
    })
}

export function processUrn(urn) {
  const url = `/`

  return url + urn
}
