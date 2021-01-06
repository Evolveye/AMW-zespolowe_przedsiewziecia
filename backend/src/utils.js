import { LOG_ONLY_PAGES_ROUTE } from "./constants/serverConsts.js"
import Logger, { logUnderControl as logUnderCtrl } from "./Logger.js"

export const logUnderControl = logUnderCtrl

/** @param {import("express").Request} req */
export const isRequestPageRoute = req => !req.url.match( /\.[^\.]+$/ )
/** @param {import("express").Request} req */
export const doRequestLogShouldBePrinted = req =>
  LOG_ONLY_PAGES_ROUTE ? isRequestPageRoute( req ) : false