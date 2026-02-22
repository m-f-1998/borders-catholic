import { extname, join, resolve } from "path"
import { createReadStream, existsSync } from "fs"
import { access, constants, stat, readFile } from "fs/promises"
import { config } from "dotenv"
import { FastifyPluginAsync } from "fastify"
import mime from "mime"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

const clientFolder = join ( process.cwd ( ), "../client" )

export const router: FastifyPluginAsync = async app => {
  app.get ( "*", async ( req, rep ) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const asset = req.params as { "*": string }
    const address = resolve ( clientFolder, asset [ "*" ] )

    if ( !address.startsWith ( clientFolder ) ) {
      return rep.status ( 400 ).send ( "Bad Request" )
    }

    if ( !process.env [ "GOOGLE_KEY" ] ) {
      rep.status ( 500 ).send ( "Internal Server Error: GOOGLE_KEY is not set." )
      return
    }

    if ( existsSync ( address ) ) {
      try {
        await access ( address, constants.F_OK )
        const stats = await stat ( address )
        if ( stats.isFile ( ) ) {
          const fileExt = extname ( address ).toLowerCase ( )
          const contentType = mime.getType ( fileExt ) || "application/octet-stream"
          const stream = createReadStream ( address )
          return rep.type ( contentType ).send ( stream )
        }
      } catch ( err ) {
        console.error ( err )
        return rep.status ( 500 ).send ( "Internal Server Error: Index File Does Not Exist" )
      }
    }

    try {
      const indexContent = await fetchIndex ( req.cspNonce || "" )
      return rep.type ( "text/html" ).send ( indexContent )
    } catch {
      return rep.status ( 500 ).send ( "Internal Server Error" )
    }
  } )

  const fetchIndex = async ( nonce: string ) => {
    const indexHTML = join ( clientFolder, "index.html" )
    if ( existsSync ( indexHTML ) ) {
      let html = await readFile ( indexHTML, "utf8" )
      if ( nonce ) {
        const metaTag = `<meta name="csp-nonce" content="${nonce}">`
        html = html.replace ( "</head>", `${metaTag}</head>` )
      }
      html = loadGoogleMaps ( html, nonce )
      html = injectGoogleTagManager ( html, nonce )
      return html
    } else {
      throw new Error ( "Index file not found" )
    }
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

// const injectScripts = ( html: string, nonce: string, url: string ): string => {
//   const script = `<script nonce="${nonce}" type="module" async defer src="${url}"></script>`
//   const headIndex = html.indexOf ( "</head>" )
//   if ( headIndex !== -1 ) {
//     return html.slice ( 0, headIndex ) + script + html.slice ( headIndex )
//   }
//   return html + script
// }

const injectGoogleTagManager = ( html: string, nonce: string ): string => {
  const gtmScript = `<script nonce="${nonce}" async src="https://www.googletagmanager.com/gtag/js?id=G-8BJ3R2M3MR"></script>
    <script nonce="${nonce}">
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-8BJ3R2M3MR');
    </script>`

  const bodyIndex = html.indexOf ( "<body>" )
  if ( bodyIndex !== -1 ) {
    return html.slice ( 0, bodyIndex ) + gtmScript + html.slice ( bodyIndex )
  }
  return html + gtmScript
}