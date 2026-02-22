import { config } from "dotenv"
import { join, normalize, resolve } from "path"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

const isDevMode = ( ) => process.env [ "DEV" ] === "true"

import sharp from "sharp"
import { existsSync } from "fs"
import { FastifyPluginAsync } from "fastify"

const IMAGE_DIR = join ( process.cwd ( ), "../", "assets", "img", )

const SUPPORTED_FORMATS = [ "webp", "avif", "jpeg", "png" ]

sharp.cache ( !isDevMode ( ) )

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

      const width = w ? parseInt ( w as string, 10 ) : null
      const height = h ? parseInt ( h as string, 10 ) : null
      const format = SUPPORTED_FORMATS.includes ( f as string ) ? ( f as string ) : "webp"
      const quality = q ? parseInt ( q as string, 10 ) : 80

      const safeFilename = normalize ( filename ).replace ( /^(\.\.(\/|\\|$))+/, "" )
      const inputPath = join ( IMAGE_DIR, safeFilename )
      if ( !existsSync ( inputPath ) ) {
        console.log ( "Image not found:", inputPath )
        return rep.status ( 404 ).send ( "Image not found" )
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

      rep.type ( format )
      rep.header ( "content-length", ( await transformer.toBuffer ( ) ).length )
      rep.header ( "content-disposition", `inline; filename="${filename.replace ( /"/g, "" ).replace ( /\s/g, "_" )}"` )
      return rep.send ( await transformer.toBuffer ( ) )
    } catch ( err ) {
      console.error ( err )
      return rep.status ( 500 ).send ( "Error processing image" )
    }
  } )
}