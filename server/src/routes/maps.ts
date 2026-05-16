import { config } from "dotenv"
import { resolve } from "path"
import { FastifyPluginAsync } from "fastify"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

const isDevMode = ( ) => process.env [ "DEV" ] === "true"

export const router: FastifyPluginAsync = async app => {
  if ( !isDevMode ( ) ) return

  app.get ( "/bootstrap", async ( _req, reply ) => {
    const key = process.env [ "GOOGLE_KEY" ] ?? ""
    return reply.redirect ( `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly` )
  } )
}
