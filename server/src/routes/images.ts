import { config } from "dotenv"
import { basename, join, normalize, resolve, sep } from "path"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

const isDevMode = ( ) => process.env [ "DEV" ] === "true"

import sharp from "sharp"
import { stat } from "fs/promises"
import { FastifyPluginAsync } from "fastify"
import { createHash } from "crypto"

const IMAGE_DIR = join ( process.cwd ( ), "../", "assets", "img", )

const SUPPORTED_FORMATS = [ "webp", "avif", "jpeg", "png" ]

const MIME_TYPES: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  jpeg: "image/jpeg",
  png: "image/png",
}

sharp.cache ( !isDevMode ( ) )
sharp.concurrency ( isDevMode ( ) ? 1 : 4 )

export const router: FastifyPluginAsync = async app => {
  app.get ( "/*", async ( req, rep ) => {
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const asset = req.params as { "*": string }
      const filename = asset [ "*" ]

      if ( !filename ) {
        return rep.status ( 400 ).send ( "Filename is required" )
      }

      const { w, h, f, q } = req.query as { w?: string; h?: string; f?: string; q?: string }

      const MAX_DIM = 3840
      const clampDim = ( v: string | undefined ): number | undefined => {
        if ( !v ) return undefined
        const n = parseInt ( v, 10 )
        if ( isNaN ( n ) || n <= 0 ) return undefined
        return Math.min ( n, MAX_DIM )
      }
      const parseIntSafe = ( v: string | undefined, fallback: number ) => {
        const n = v ? parseInt ( v, 10 ) : NaN
        return isNaN ( n ) ? fallback : n
      }
      const width   = clampDim ( w )
      const height  = clampDim ( h )
      const format  = SUPPORTED_FORMATS.includes ( f as string ) ? ( f as string ) : "webp"
      const quality = Math.min ( Math.max ( parseIntSafe ( q, 80 ), 1 ), 100 )

      const safeFilename = normalize ( filename ).replace ( /^(\.\.(\/|\\|$))+/, "" )
      const inputPath = join ( IMAGE_DIR, safeFilename )

      if ( !inputPath.startsWith ( IMAGE_DIR + sep ) ) {
        return rep.status ( 403 ).send ( "Forbidden" )
      }

      const fileStats = await stat ( inputPath ).catch ( ( ) => null )
      if ( !fileStats ) {
        console.log ( "Image not found:", inputPath )
        return rep.status ( 404 ).send ( "Image not found" )
      }

      const lastModified = fileStats.mtime.toUTCString ( )
      const etagBase = `${fileStats.mtimeMs}-${fileStats.size}-${width}-${height}-${format}-${quality}`
      const etag = createHash ( "sha1" ).update ( etagBase ).digest ( "hex" )

      const ifNoneMatch = req.headers [ "if-none-match" ]
      if ( ifNoneMatch === `"${etag}"` ) {
        return rep.status ( 304 ).send ( )
      }
      const ifModifiedSince = req.headers [ "if-modified-since" ]
      if ( ifModifiedSince && new Date ( ifModifiedSince ) >= fileStats.mtime ) {
        return rep.status ( 304 ).send ( )
      }

      let transformer = sharp ( inputPath )
        .resize ( width, height, { fit: "inside", withoutEnlargement: true } )

      switch ( format ) {
        case "jpeg":
          transformer = transformer.jpeg ( { quality, progressive: true } )
          break
        case "png":
          transformer = transformer.png ( { quality } )
          break
        case "avif":
          transformer = transformer.avif ( { quality } )
          break
        default:
          transformer = transformer.webp ( { quality } )
      }

      const buffer = await transformer.toBuffer ( )
      const safeName = basename ( filename ).replace ( /"/g, "" ).replace ( /\s/g, "_" )
      rep.type ( MIME_TYPES [ format ] ?? "application/octet-stream" )
      rep.header ( "content-length", buffer.length )
      rep.header ( "content-disposition", `inline; filename="${safeName}"` )
      rep.header ( "cache-control", "public, max-age=31536000" )
      rep.header ( "last-modified", lastModified )
      rep.header ( "etag", `"${etag}"` )
      return rep.send ( buffer )
    } catch ( err ) {
      console.error ( err )
      return rep.status ( 500 ).send ( "Error processing image" )
    }
  } )
}