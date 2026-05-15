import { Injectable, isDevMode } from "@angular/core"

@Injectable ( {
  providedIn: "root"
} )
export class MapsService {
  private loaded = false
  private loadingPromise: Promise<void> | null = null

  public load ( ): Promise<void> {
    if ( !isDevMode ( ) ) {
      return Promise.resolve ( )
    }
    if ( this.loaded ) return Promise.resolve ( )
    if ( this.loadingPromise ) return this.loadingPromise

    this.loadingPromise = new Promise<void> ( ( resolve, reject ) => {
      const script = document.createElement ( "script" )
      script.src = "/api/maps/bootstrap"
      script.async = true
      script.defer = true
      script.onload = ( ) => { this.loaded = true; resolve ( ) }
      script.onerror = ( ) => reject ( new Error ( "Google Maps API failed to load" ) )
      document.head.appendChild ( script )
    } )

    return this.loadingPromise
  }
}
