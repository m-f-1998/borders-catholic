import { addDays, format, getDay, subDays } from "date-fns"
import { Router } from "express"
import { rateLimit } from "express-rate-limit"
import { google } from "googleapis"
import { config } from "dotenv"
import { resolve } from "path"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

export const router = Router ( )

router.use ( rateLimit ( {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
    description: "You have exceeded the maximum number of requests allowed. Please wait a minute before trying again."
  }
} ) )

const driveID = "1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG"

const getPreviousSunday = ( ) => {
  const today = new Date ( )
  const isSaturday = getDay ( today ) === 6
  const sunday = isSaturday ? addDays ( today, 1 ) : subDays ( today, getDay ( today ) )
  return format ( sunday, "yyyy-MM-dd" )  // return formatted date
}

const monthFolderName = ( date: Date ) => `${format ( date, "MM" )} - ${format ( date, "LLLL" )}`

const listFiles = async ( parentId: string, referrer: string ) => {
  if ( !parentId ) return [ ]

  const drive = google.drive ( {
    version: "v3",
    auth: process.env [ "GOOGLE_KEY" ],
    referrer
  } )

  const response = await drive.files.list ( {
    q: `'${parentId}' in parents`,
    fields: "files(id, name)",
    pageSize: 20
  } )

  return response.data.files || [ ]
}

let cache: string = ""
let newsletterDate: Date | null = null

router.get ( "/api/newsletter", async ( req, res ) => {
  try {
    const dateStr = getPreviousSunday ( )
    const date = new Date ( dateStr )

    if ( cache && newsletterDate && format ( newsletterDate, "yyyy-MM-dd" ) === dateStr ) {
      res.json ( { url: cache } )
      return
    } else {
      cache = ""
      newsletterDate = null
    }

    const yearName = format ( date, "yyyy" )
    const monthName = monthFolderName ( date )

    const yearFolder = ( await listFiles ( driveID, req.headers.referer ?? "" ) )
      .find ( f => f.name === yearName )

    if ( !yearFolder ) {
      res.status ( 404 ).json ( { error: `Year folder "${yearName}" not found` } )
      return
    }

    const monthFolder = ( await listFiles ( yearFolder.id ?? "", req.headers.referer ?? "" ) )
      .find ( f => f.name === monthName )

    if ( !monthFolder ) {
      res.status ( 404 ).json ( { error: `Month folder "${monthName}" not found` } )
      return
    }

    const files = await listFiles ( monthFolder.id ?? "", req.headers.referer ?? "" )
    const file = files.find ( f => f.name === `${dateStr}.pdf` )

    if ( file ) {
      cache = `https://drive.google.com/file/d/${file.id}/view`
      newsletterDate = date
    }

    const url = file
      ? `https://drive.google.com/file/d/${file.id}/view`
      : `https://drive.google.com/drive/folders/${driveID}`

    res.json ( { url } )
  } catch ( err ) {
    console.error ( err )
    res.status ( 500 ).json ( { error: "Unable to retrieve newsletter URL" } )
  }
} )