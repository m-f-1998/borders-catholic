import { FastifyPluginAsync } from "fastify"

export const router: FastifyPluginAsync = async _app => {
  // Maps bootstrap is handled server-side in static.ts via loadGoogleMaps().
}
