import { Injectable, isDevMode } from "@angular/core"

@Injectable ( {
  providedIn: "root"
} )
export class MapsService {
  private loaded = false
  private loadingPromise: Promise<void> | null = null

  public load ( ): Promise<void> {
    // Deduplicate concurrent calls — share a single in-flight promise
    if ( this.loadingPromise ) return this.loadingPromise

    if ( !isDevMode ( ) ) {
      // In production the Google Maps bootstrap script is injected server-side.
      // Resolve immediately if already available, otherwise poll (up to 5s).
      if ( ( window as any ).google?.maps ) {
        return Promise.resolve ( )
      }
      this.loadingPromise = new Promise<void> ( ( resolve, reject ) => {
        const start = Date.now ( )
        const poll = setInterval ( ( ) => {
          if ( ( window as any ).google?.maps ) {
            clearInterval ( poll )
            this.loaded = true
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

    if ( this.loaded ) return Promise.resolve ( )

    this.loadingPromise = new Promise<void> ( ( resolve, reject ) => {
      const script = document.createElement ( "script" )
      script.src = "/api/maps/bootstrap"
      script.async = true
      script.defer = true
      script.onload = ( ) => {
        this.loaded = true
        this.loadingPromise = null
        resolve ( )
      }
      script.onerror = ( ) => {
        this.loadingPromise = null
        reject ( new Error ( "Google Maps API failed to load" ) )
      }
      document.head.appendChild ( script )
    } )

    return this.loadingPromise
  }
}
