import { config } from "dotenv"
import { resolve } from "path"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

const isDevMode = ( ) => process.env [ "DEV" ] === "true"

import { addDays, format, getDay, subDays } from "date-fns"
import { google } from "googleapis"
import { FastifyPluginAsync } from "fastify"

const driveID = "1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG"

const getPreviousSunday = ( ) => {
  const today = new Date ( )
  const isSaturday = getDay ( today ) === 6
  const sunday = isSaturday ? addDays ( today, 1 ) : subDays ( today, getDay ( today ) )
  return format ( sunday, "yyyy-MM-dd" )  // return formatted date
}

const monthFolderName = ( date: Date ) => `${format ( date, "MM" )} - ${format ( date, "LLLL" )}`

const listFiles = async ( parentId: string ) => {
  if ( !parentId ) return [ ]

  const referrer = isDevMode ( ) ? "http://localhost:3000" : "https://borderscatholic.co.uk"
  const drive = google.drive ( { version: "v3", auth: process.env [ "GOOGLE_KEY" ], referrer } )

  const results: Array<{ id?: string | null; name?: string | null }> = []
  let pageToken: string | undefined

  do {
    const response = await drive.files.list ( {
      q: `'${parentId}' in parents`,
      fields: "nextPageToken, files(id, name)",
      pageSize: 100,
      pageToken
    } )
    if ( response.data.files ) {
      results.push ( ...response.data.files )
    }
    pageToken = response.data.nextPageToken ?? undefined
  } while ( pageToken )

  return results
}

let cache: string = ""
let newsletterDate: Date | null = null
let inflightRequest: Promise<{ url: string }> | null = null

export const router: FastifyPluginAsync = async app => {
  app.get ( "/newsletter", async ( _req, rep ) => {
    try {
      const dateStr = getPreviousSunday ( )
      const date = new Date ( dateStr )

      if ( cache && newsletterDate && format ( newsletterDate, "yyyy-MM-dd" ) === dateStr ) {
        return rep.send ( { url: cache } )
      } else {
        cache = ""
        newsletterDate = null
      }

      if ( inflightRequest ) {
        const result = await inflightRequest
        return rep.send ( result )
      }

      inflightRequest = ( async ( ) => {
        const yearName = format ( date, "yyyy" )
        const monthName = monthFolderName ( date )

        const yearFolder = ( await listFiles ( driveID ) )
          .find ( f => f.name === yearName )

        if ( !yearFolder ) {
          return { url: `https://drive.google.com/drive/folders/${driveID}` }
        }

        const monthFolder = ( await listFiles ( yearFolder.id ?? "" ) )
          .find ( f => f.name === monthName )

        if ( !monthFolder ) {
          return { url: `https://drive.google.com/drive/folders/${driveID}` }
        }

        const files = await listFiles ( monthFolder.id ?? "" )
        const file = files.find ( f => f.name === `${dateStr}.pdf` )

        if ( file ) {
          cache = `https://drive.google.com/file/d/${file.id}/view`
          newsletterDate = date
        }

        return {
          url: file
            ? `https://drive.google.com/file/d/${file.id}/view`
            : `https://drive.google.com/drive/folders/${driveID}`
        }
      } ) ( ).finally ( ( ) => { inflightRequest = null } )

      const result = await inflightRequest
      return rep.send ( result )
    } catch ( err ) {
      console.error ( err )
      return rep.status ( 500 ).send ( { error: "Unable to retrieve newsletter URL" } )
    }
  } )
}