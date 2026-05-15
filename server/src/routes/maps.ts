import { FastifyPluginAsync } from "fastify"

export const router: FastifyPluginAsync = async app => {
  app.get ( "/bootstrap", async ( _req, reply ) => {
    const key = process.env [ "GOOGLE_KEY" ] ?? ""
    return reply.redirect ( `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly` )
  } )
}
