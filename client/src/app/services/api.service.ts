import { HttpClient, HttpHeaders } from "@angular/common/http"
import { inject, Injectable, isDevMode } from "@angular/core"
import { firstValueFrom } from "rxjs"

@Injectable ( {
  providedIn: "root"
} )
export class ApiService {
  private readonly httpClient: HttpClient = inject ( HttpClient )

  public get<T = unknown> ( path: string, params: Record<string, unknown> = { } ) {
    const address = ( isDevMode ( ) ? "http://localhost:3000" : "" ) + path
    return firstValueFrom (
      this.httpClient.get<T> ( address, { params: params as Record<string, string | number | boolean> } )
    )
  }

  public post<T = unknown> ( path: string, body: Record<string, unknown> | FormData = { } ) {
    const address = ( isDevMode ( ) ? "http://localhost:3000" : "" ) + path
    let headers = new HttpHeaders ( )

    if ( !( body instanceof FormData ) ) {
      headers = headers.append ( "Content-Type", "application/json" )
    }

    return firstValueFrom (
      this.httpClient.post<T> ( address, body, { headers } )
    )
  }
}
