import { config } from "dotenv"
import { resolve } from "path"

const envPath = resolve ( process.cwd ( ), ".env" )
config ( { path: envPath, quiet: true } )

const isDevMode = ( ) => process.env [ "DEV" ] === "true"

import type { FastifyPluginAsync, FastifyReply } from "fastify"
import { google, type drive_v3 } from "googleapis"

const DRIVE_ID = "1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG"
const ARCHIVE_URL = `https://drive.google.com/drive/folders/${DRIVE_ID}`
const MISS_TTL_MS = 5 * 60 * 1000
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

type NewsletterResult = {
  url: string
  available: boolean
}

type FolderCache = {
  year: string
  yearId: string
  monthName?: string
  monthId?: string
}

type CachedNewsletter = {
  dateStr: string
  result: NewsletterResult
  expiresAt: number
}

// Saturday in Europe/London resolves to the coming Sunday so the vigil Mass
// can open that PDF once it has been uploaded.
export const newsletterSunday = ( now = new Date ( ) ) => {
  const formatted = new Intl.DateTimeFormat ( "en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  } ).format ( now )
  const [ year, month, day ] = formatted.split ( "-" ).map ( part => Number ( part ) )
  const date = new Date ( Date.UTC ( year, month - 1, day ) )
  const dayOfWeek = date.getUTCDay ( )
  const delta = dayOfWeek === 6 ? 1 : -dayOfWeek
  date.setUTCDate ( date.getUTCDate ( ) + delta )
  return date.toISOString ( ).slice ( 0, 10 )
}

const monthFolderName = ( dateStr: string ) => {
  const month = Number ( dateStr.slice ( 5, 7 ) )
  const label = MONTHS [ month - 1 ]
  if ( !label ) return null
  return `${dateStr.slice ( 5, 7 )} - ${label}`
}

const referrer = ( ) => isDevMode ( ) ? "http://localhost:3000" : "https://borderscatholic.co.uk"

let driveService: drive_v3.Drive | undefined

const driveClient = ( ) => {
  driveService ??= google.drive ( {
    version: "v3",
    auth: process.env [ "GOOGLE_KEY" ]
  } )
  return driveService
}

const escapeQuery = ( value: string ) => value.replace ( /['\\]/g, "\\$&" )

const findChild = async ( parentId: string, name: string ) => {
  if ( !/^[a-zA-Z0-9_-]+$/.test ( parentId ) ) return null

  const response = await driveClient ( ).files.list ( {
    q: `'${parentId}' in parents and name = '${escapeQuery ( name )}' and trashed = false`,
    fields: "files(id)",
    pageSize: 1
  }, {
    headers: { Referer: referrer ( ) },
    timeout: 8000
  } )

  return response.data.files?.[ 0 ]?.id || null
}

let folderCache: FolderCache | null = null

const resolveNewsletter = async ( dateStr: string ): Promise<NewsletterResult> => {
  const year = dateStr.slice ( 0, 4 )
  const monthName = monthFolderName ( dateStr )
  if ( !monthName ) return { url: ARCHIVE_URL, available: false }

  let folders: FolderCache | null = folderCache?.year === year ? folderCache : null
  if ( !folders ) {
    const yearId = await findChild ( DRIVE_ID, year )
    if ( !yearId ) return { url: ARCHIVE_URL, available: false }
    folders = { year, yearId }
    folderCache = folders
  }

  let monthId = folders.monthName === monthName ? folders.monthId ?? null : null
  if ( !monthId ) {
    monthId = await findChild ( folders.yearId, monthName )
    if ( !monthId ) return { url: ARCHIVE_URL, available: false }
    folders = { year, yearId: folders.yearId, monthName, monthId }
    folderCache = folders
  }

  const fileId = await findChild ( monthId, `${dateStr}.pdf` )
  if ( !fileId ) return { url: ARCHIVE_URL, available: false }

  return {
    url: `https://drive.google.com/file/d/${fileId}/view`,
    available: true
  }
}

let cached: CachedNewsletter | null = null
let inflight: { dateStr: string; task: Promise<NewsletterResult> } | null = null

const readCache = ( dateStr: string ) => {
  if ( !cached || cached.dateStr !== dateStr ) return null
  if ( cached.result.available ) return cached.result
  if ( cached.expiresAt > Date.now ( ) ) return cached.result
  return null
}

const loadNewsletter = ( dateStr: string ) => {
  if ( inflight?.dateStr === dateStr ) return inflight.task

  const task = resolveNewsletter ( dateStr ).then ( result => {
    cached = {
      dateStr,
      result,
      expiresAt: result.available ? 0 : Date.now ( ) + MISS_TTL_MS
    }
    return result
  } )

  inflight = { dateStr, task }
  void task.finally ( ( ) => {
    if ( inflight?.task === task ) inflight = null
  } )
  return task
}

const errorMessage = ( err: unknown ) => {
  const message = err instanceof Error ? err.message : "Drive request failed"
  return message.replace ( /key=[^&\s]+/gi, "key=redacted" )
}

const sendResult = ( rep: FastifyReply, result: NewsletterResult ) => {
  rep.header ( "Cache-Control", result.available ? "public, max-age=300" : "no-store" )
  return rep.send ( result )
}

export const router: FastifyPluginAsync = async app => {
  app.get ( "/newsletter", async ( _req, rep ) => {
    const dateStr = newsletterSunday ( )

    const hit = readCache ( dateStr )
    if ( hit ) return sendResult ( rep, hit )

    try {
      return sendResult ( rep, await loadNewsletter ( dateStr ) )
    } catch ( err ) {
      console.error ( "Newsletter lookup failed:", errorMessage ( err ) )
      return rep.status ( 500 ).send ( { error: "Unable to retrieve newsletter URL" } )
    }
  } )
}
