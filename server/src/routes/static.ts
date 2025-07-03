import express, { Router, Request } from "express"
import type { Response } from "express"
import { join } from "path"
import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { rateLimit } from "express-rate-limit"

export const router = Router ( )

router.use ( rateLimit ( {
  windowMs: 60 * 1000, // 1 minute
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
    description: "You have exceeded the maximum number of requests allowed. Please wait a minute before trying again."
  }
} ) )

router.use ( express.static ( join ( process.cwd ( ), "../client" ), {
  maxAge: "1d",
  etag: true,
  index: false,
} ) )

router.get ( "*get", async ( _req: Request, res: Response ) => {
  const indexPath = join ( process.cwd ( ), "../client/index.html" )
  if ( existsSync ( indexPath ) ) {
    const html = await readFile ( indexPath, "utf8" )
    const nonce = res.locals [ "cspNonce" ]
    const metaTag = `<meta name="csp-nonce" content="${nonce}">`
    const updatedHtml = html.replace ( "</head>", `${metaTag}</head>` )
    res.send ( injectGoogleTagManager ( updatedHtml, nonce ) )
  } else {
    res.status ( 404 ).send ( "Index file not found." )
  }
} )

const injectGoogleTagManager = ( html: string, nonce: string ): string => {
  // Add the above between the </head> and <body> tags
  const gtmScript = `<script nonce="${nonce}" async src="https://www.googletagmanager.com/gtag/js?id=G-BKXJTC9XPM"></script>
    <script nonce="${nonce}">
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-BKXJTC9XPM');
    </script>`

  const bodyIndex = html.indexOf ( "<body>" )
  if ( bodyIndex !== -1 ) {
    return html.slice ( 0, bodyIndex ) + gtmScript + html.slice ( bodyIndex )
  }
  return html + gtmScript
}