import Logger from "./src/Logger.js"


export const PORT = 3000
export const APP_ROOT_DIR = import.meta.url.match(/(.*)\//)[1].substr(8)

export const DEBUG = true

export const LOG_PAGES_ROUTE = true
export const LOG_WS_EVENTS = true
export const CLEAR_CONSOLE = false

export const LOGGERS = {
  newRequest: new Logger( [
    { align:`left`,   color:`white`,   value:`[{hh}:{mm}:{ss}]   ` },
    { align:`center`, color:`magenta`, length:4 },
    { align:`center`, color:`white`,   value:`   --> ` },
    { align:`right`,  color:`blue` },
    { align:`center`, color:`white`,   value:` :: ` },
    { align:`left`,   color:`yellow` },
  ], { separated:false } ),
  server: new Logger( [
    { align:`left`,   color:`white`,   value:`[{hh}:{mm}:{ss}]` },
    { align:`right`,  color:`magenta`, value:`  SERVER INFO` },
    { align:`center`, color:`white`,   value:`: ` },
    { align:`left`,   color:`white` },
  ], { separated:false } ),
  module: new Logger( [
    { align:`left`,   color:`white`,   value:`[{hh}:{mm}:{ss}]` },
    { align:`right`,  color:`blue`,    value:`  MODULE INFO` },
    { align:`center`, color:`white`,   value:`: ` },
    { align:`right`,  color:`yellow`,  length:13 },
    { align:`center`, color:`white`,   value:`: ` },
    { align:`left`,   color:`white`,   firstSplitLen:50, splitLen:80 },
  ], { separated:false, separateBreakBlock:true } ),
}