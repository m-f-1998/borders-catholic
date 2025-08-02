import express, { Router, Request } from "express"
import type { Response } from "express"
import { join, resolve } from "path"
import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { config } from "dotenv"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

export const router = Router ( )

router.use ( express.static ( join ( process.cwd ( ), "../client" ), {
  maxAge: "1d",
  etag: true,
  index: false,
} ) )

router.get ( "*get", async ( _req: Request, res: Response ) => {
  const indexPath = join ( process.cwd ( ), "../client/index.html" )
  if ( !process.env [ "GOOGLE_KEY" ] ) {
    console.error ( "GOOGLE_KEY is not set in the environment variables." )
    res.status ( 500 ).send ( "Internal Server Error: GOOGLE_KEY is not set." )
    return
  }
  if ( existsSync ( indexPath ) ) {
    const html = await readFile ( indexPath, "utf8" )
    const nonce = res.locals [ "cspNonce" ]
    const metaTag = `<meta name="csp-nonce" content="${nonce}">`
    let updatedHtml = html.replace ( "</head>", `${metaTag}</head>` )
    updatedHtml = loadGoogleMaps ( updatedHtml, nonce )
    updatedHtml = injectScripts ( updatedHtml, nonce, "https://unpkg.com/default-passive-events" )
    res.send ( injectGoogleTagManager ( updatedHtml, nonce ) )
  } else {
    res.status ( 404 ).send ( "Index file not found." )
  }
} )

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

const injectScripts = ( html: string, nonce: string, url: string ): string => {
  const script = `<script nonce="${nonce}" type="module" async defer src="${url}"></script>`
  const headIndex = html.indexOf ( "</head>" )
  if ( headIndex !== -1 ) {
    return html.slice ( 0, headIndex ) + script + html.slice ( headIndex )
  }
  return html + script
}

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