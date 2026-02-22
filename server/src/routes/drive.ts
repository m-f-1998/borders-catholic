import { addDays, format, getDay, subDays } from "date-fns"
import { google } from "googleapis"
import { config } from "dotenv"
import { resolve } from "path"
import { FastifyPluginAsync } from "fastify"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

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

export const router: FastifyPluginAsync = async app => {
  app.get ( "/newsletter", async ( req, rep ) => {
    try {
      const dateStr = getPreviousSunday ( )
      const date = new Date ( dateStr )

      if ( cache && newsletterDate && format ( newsletterDate, "yyyy-MM-dd" ) === dateStr ) {
        return rep.send ( { url: cache } )
      } else {
        cache = ""
        newsletterDate = null
      }

      const yearName = format ( date, "yyyy" )
      const monthName = monthFolderName ( date )

      const yearFolder = ( await listFiles ( driveID, req.headers.referer ?? "" ) )
        .find ( f => f.name === yearName )

      if ( !yearFolder ) {
        return rep.status ( 404 ).send ( { error: `Year folder "${yearName}" not found` } )
      }

      const monthFolder = ( await listFiles ( yearFolder.id ?? "", req.headers.referer ?? "" ) )
        .find ( f => f.name === monthName )

      if ( !monthFolder ) {
        return rep.status ( 404 ).send ( { error: `Month folder "${monthName}" not found` } )
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

      return rep.send ( { url } )
    } catch ( err ) {
      console.error ( err )
      return rep.status ( 500 ).send ( { error: "Unable to retrieve newsletter URL" } )
    }
  } )
}