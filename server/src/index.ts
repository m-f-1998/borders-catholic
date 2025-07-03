import express from "express"
import type { Response } from "express"
import helmet from "helmet"

import cors from "cors"
import { router as staticRouter } from "./routes/static.js"
import { randomBytes } from "crypto"
import { rateLimit } from "express-rate-limit"

const app = express ( )

app.use ( express.json ( ) )
app.use ( express.urlencoded ( { extended: true } ) )

app.use ( express.json ( { limit: "1mb" } ) )
app.use ( express.urlencoded ( { limit: "1mb", extended: true } ) )

app.use ( cors ( {
  origin: [ "http://localhost:4200", "https://borderscatholic.co.uk" ],
  methods: [ "GET", "POST" ],
  allowedHeaders: [ "Content-Type", "Authorization" ],
  credentials: true
} ) )

app.use ( ( _req, res, next ) => {
  const nonce = randomBytes ( 16 ).toString ( "base64" )
  res.locals [ "cspNonce" ] = nonce
  next ( )
} )

app.use ( helmet ( {
  frameguard: {
    action: "deny"
  },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [
        "'none'",
      ],
      scriptSrc: [
        "'self'",
        "www.googletagmanager.com"
      ],
      styleSrc: [
        "'self'",
        ( _req, res ) => `'nonce-${( res as Response ).locals[ "cspNonce" ]}'`,
      ],
      scriptSrcElem: [
        "'self'",
        ( _req, res ) => `'nonce-${( res as Response ).locals[ "cspNonce" ]}'`
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://\*.jsdelivr.net",
      ],
      connectSrc: [
        "'self'",
        "https://\*.google-analytics.com",
        "https://\*.google.com",
      ],
      frameSrc: [
        "'self'",
        "https://www.google.com"
      ]
    }
  },
  noSniff: true,
  xssFilter: true,
  ieNoOpen: true
} ) )

app.use ( "/assets", rateLimit ( {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
} ) )

app.use ( staticRouter )

app.listen ( 3000, ( ) => {
  console.log ( "Server running on port 3000" )
} )
