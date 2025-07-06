import { HttpClient, HttpHeaders } from "@angular/common/http"
import { inject, Injectable, isDevMode } from "@angular/core"
import { parse } from "date-fns"

@Injectable ( {
  providedIn: "root"
} )
export class ApiService {
  private readonly httpClient: HttpClient = inject ( HttpClient )

  public get ( path: string, body: any = { },  ) {
    const address = ( isDevMode ( ) ? "http://localhost:3000" : "" ) + path
    let headers = new HttpHeaders ( )

    if ( !( body instanceof FormData ) ) {
      headers = headers.append ( "Content-Type", "application/json" )
    }

    return new Promise ( ( resolve, reject ) => {
      this.httpClient.get ( address, {
        params: body,
        headers,
        responseType: address.endsWith ( "/asset.php" ) ? "blob" : "json"
      } as object ).subscribe ( {
        next: response => {
          resolve ( this.parseObj ( response ) )
        },
        error: error => {
          reject ( error )
        }
      } )
    } )
  }

  public post ( path: string, body: any = { } ) {
    const address = ( isDevMode ( ) ? "http://localhost:3000" : "" ) + path
    let headers = new HttpHeaders ( )

    if ( !( body instanceof FormData ) ) {
      headers = headers.append ( "Content-Type", "application/json" )
    }

    return new Promise ( ( resolve, reject ) => {
      this.httpClient.post ( address, body, {
        headers,
        responseType: address.endsWith ( "/asset.php" ) ? "blob" : "json"
      } as object ).subscribe ( {
        next: response => {
          resolve ( this.parseObj ( response ) )
        },
        error: error => {
          reject ( error )
        }
      } )
    } )
  }

  private parseObj ( obj: any ): any {
    const res = obj
    if ( res instanceof Object ) {
      for ( const key of Object.keys ( res ) ) {
        if ( res [ key ] ) {
          if ( Array.isArray ( res [ key ] ) ) {
            res [ key ] = res [ key ].map ( ( x: any ) => this.parseObj ( x ) )
          } else if ( typeof obj [ key ] === "object" ) {
            res [ key ] = this.parseObj ( res [ key ] )
          } else if ( this.isNumber ( res [ key ] ) ) {
            res [ key ] = Number ( res [ key ] )
          } else if ( this.isBool ( res [ key ] ) ) {
            res [ key ] = Boolean ( res [ key ] )
          }
          res [ key ] = this.checkDate ( res [ key ] )
        }
      }
    }
    return res
  }

  private isBool = ( value: string ): boolean => {
    return String ( value ).toUpperCase ( ) === "TRUE" || String ( value ).toUpperCase ( ) === "FALSE"
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