import { extname, join, resolve, sep } from "path"
import { createReadStream } from "fs"
import { access, constants, stat, readFile } from "fs/promises"
import { config } from "dotenv"
import { FastifyPluginAsync } from "fastify"
import mime from "mime"
import { isDevMode } from "../index.js"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

const clientFolder = join ( process.cwd ( ), "../client" )

let cachedIndexTemplate: string | null = null

const loadIndexTemplate = async ( ): Promise<string> => {
  if ( cachedIndexTemplate ) return cachedIndexTemplate
  const indexHTML = join ( clientFolder, "index.html" )
  const idxExists = await access ( indexHTML, constants.F_OK ).then ( ( ) => true ).catch ( ( ) => false )
  if ( !idxExists ) throw new Error ( "Index file not found" )
  cachedIndexTemplate = await readFile ( indexHTML, "utf8" )
  return cachedIndexTemplate
}

export const router: FastifyPluginAsync = async app => {
  app.get ( "*", async ( req, rep ) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const asset = req.params as { "*": string }
    const address = resolve ( clientFolder, asset [ "*" ] )

    if ( address !== clientFolder && !address.startsWith ( clientFolder + sep ) ) {
      return rep.status ( 400 ).send ( "Bad Request" )
    }

    const fileExists = await access ( address, constants.F_OK ).then ( ( ) => true ).catch ( ( ) => false )
    if ( fileExists ) {
      try {
        const stats = await stat ( address )
        if ( stats.isFile ( ) ) {
          const fileExt = extname ( address ).toLowerCase ( )
          const contentType = mime.getType ( fileExt ) || "application/octet-stream"
          const isHashed = /\.[a-zA-Z0-9]{8,}\.(js|css|woff2?|ttf|eot|svg|png|jpg|ico)$/.test ( address )
          if ( isHashed ) {
            rep.header ( "cache-control", "public, max-age=31536000, immutable" )
          }
          const stream = createReadStream ( address )
          return rep.type ( contentType ).send ( stream )
        }
      } catch ( err ) {
        console.error ( err )
        return rep.status ( 500 ).send ( "Internal Server Error: Index File Does Not Exist" )
      }
    }

    // Only HTML (SPA fallback) needs GOOGLE_KEY — warn but don't block
    if ( !process.env [ "GOOGLE_KEY" ] ) {
      console.warn ( "GOOGLE_KEY is not set — Google Maps will not load." )
    }

    try {
      const indexContent = await fetchIndex ( req.cspNonce || "" )
      rep.header ( "cache-control", "no-cache" )
      return rep.type ( "text/html" ).send ( indexContent )
    } catch ( err ) {
      console.error ( err )
      return rep.status ( 500 ).send ( "Internal Server Error" )
    }
  } )

  const fetchIndex = async ( nonce: string ) => {
    let html = await loadIndexTemplate ( )
    if ( nonce ) {
      const metaTag = `<meta name="csp-nonce" content="${nonce}">`
      html = html.replace ( "</head>", `${metaTag}</head>` )
    }
    const heroPreload = `<link rel="preload" as="image" href="/api/img/new-header.jpg" fetchpriority="high">`
    html = html.replace ( "</head>", `${heroPreload}</head>` )
    html = loadGoogleMaps ( html, nonce )
    if ( !isDevMode ( ) ) html = injectGoogleTagManager ( html, nonce )
    return html
  }
}

const loadGoogleMaps = ( html: string, nonce: string ): string => {
  const script = `<script nonce="${nonce}">
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=\`https://maps.\$\{c\}apis.com/maps/api/js?\`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      v: "weekly",
      key: "${process.env [ "GOOGLE_KEY" ]}"
    });
  </script>`
  const headIndex = html.indexOf ( "</head>" )
  if ( headIndex !== -1 ) {
    return html.slice ( 0, headIndex ) + script + html.slice ( headIndex )
  }
  return html + script
}


const injectGoogleTagManager = ( html: string, nonce: string ): string => {
  const measurementId = process.env [ "GA_MEASUREMENT_ID" ] || "G-8BJ3R2M3MR"
  const gtmScript = `<script nonce="${nonce}" async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
    <script nonce="${nonce}">
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    </script>`

  const bodyIndex = html.indexOf ( "<body>" )
  if ( bodyIndex !== -1 ) {
    const afterBody = bodyIndex + "<body>".length
    return html.slice ( 0, afterBody ) + gtmScript + html.slice ( afterBody )
  }
  return html + gtmScript
}