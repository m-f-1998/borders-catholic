import { Injectable } from "@angular/core"

@Injectable ( {
  providedIn: "root"
} )
export class MapsService {
  private loadingPromise: Promise<void> | null = null

  public load ( ): Promise<void> {
    if ( this.loadingPromise ) return this.loadingPromise

    if ( ( window as any ).google?.maps ) return Promise.resolve ( )

    // The Maps bootstrap script is always injected server-side into the HTML.
    // Poll until the google.maps namespace is available (max 5s).
    this.loadingPromise = new Promise<void> ( ( resolve, reject ) => {
      const start = Date.now ( )
      const poll = setInterval ( ( ) => {
        if ( ( window as any ).google?.maps ) {
          clearInterval ( poll )
          this.loadingPromise = null
          resolve ( )
        } else if ( Date.now ( ) - start > 5000 ) {
          clearInterval ( poll )
          this.loadingPromise = null
          reject ( new Error ( "Google Maps API timed out" ) )
        }
      }, 100 )
    } )

    return this.loadingPromise
  }
}
