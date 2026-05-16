import { HttpClient, HttpHeaders } from "@angular/common/http"
import { inject, Injectable, isDevMode } from "@angular/core"
import { firstValueFrom } from "rxjs"
import { parse } from "date-fns"

@Injectable ( {
  providedIn: "root"
} )
export class ApiService {
  private readonly httpClient: HttpClient = inject ( HttpClient )

  public get ( path: string, body: Record<string, unknown> = { } ) {
    const address = ( isDevMode ( ) ? "http://localhost:3000" : "" ) + path
    return firstValueFrom (
      this.httpClient.get ( address, { params: body as any } )
    ).then ( res => this.parseObj ( res ) )
  }

  public post ( path: string, body: Record<string, unknown> | FormData = { } ) {
    const address = ( isDevMode ( ) ? "http://localhost:3000" : "" ) + path
    let headers = new HttpHeaders ( )

    if ( !( body instanceof FormData ) ) {
      headers = headers.append ( "Content-Type", "application/json" )
    }

    return firstValueFrom (
      this.httpClient.post ( address, body, { headers } )
    ).then ( res => this.parseObj ( res ) )
  }

  private parseObj ( obj: unknown ): unknown {
    if ( Array.isArray ( obj ) ) {
      return obj.map ( x => this.parseObj ( x ) )
    }
    if ( obj !== null && typeof obj === "object" ) {
      const res: Record<string, unknown> = { ...( obj as Record<string, unknown> ) }
      for ( const key of Object.keys ( res ) ) {
        if ( res [ key ] ) {
          if ( Array.isArray ( res [ key ] ) ) {
            res [ key ] = ( res [ key ] as unknown[] ).map ( x => this.parseObj ( x ) )
          } else if ( typeof res [ key ] === "object" ) {
            res [ key ] = this.parseObj ( res [ key ] )
          } else if ( this.isNumber ( res [ key ] as string ) ) {
            res [ key ] = Number ( res [ key ] )
          } else if ( this.isBool ( res [ key ] as string ) ) {
            res [ key ] = String ( res [ key ] ).toUpperCase ( ) === "TRUE"
          } else {
            res [ key ] = this.checkDate ( res [ key ] as string )
          }
        }
      }
      return res
    }
    return obj
  }

  private isBool = ( value: string ): boolean => {
    const upper = String ( value ).toUpperCase ( )
    return upper === "TRUE" || upper === "FALSE"
  }

  private isNumber = ( value: string ): boolean => {
    if ( value != null ) {
      return ( String ( value ).length == 1 || !String ( value ).startsWith ( "0" ) ) && !isNaN ( Number ( value ) ) && String ( value ) != ""
    }
    return false
  }

  private checkDate = ( value: string ): Date | string  => {
    const dangerous_format = [
      "yyyy-MM-dd",
      "dd/MM/yyyy"
    ]

    for ( const format of [
      "dd/MM/yyyy HH:mm",
      "E dd/MM/yyyy",
      "E dd/MM/yyyy HH:mm",
      "yyyy-MM-dd",
      "dd/MM/yyyy",
      "yyyy-MM-dd HH:mm:ss",
      "yyyy-MM-dd HH:mm",
      "yyyy-MM-dd HH:mm:ss.SSSSSS"
    ] ) {
      try {
        const res = parse ( value, format, new Date ( ) )

        const is_dangerous = dangerous_format.includes ( format )
        const allow_dangerous = is_dangerous && format.length === value.length

        if ( res.toString ( ) !== "Invalid Date" && ( !is_dangerous || allow_dangerous ) ) {
          return res
        }
      } catch {
        continue
      }
    }
    return value
  }
}