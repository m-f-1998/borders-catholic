
import { ChangeDetectionStrategy, Component, inject, input, InputSignal, OnInit, signal, WritableSignal } from "@angular/core"
import { IconComponent } from "@app/icon/icon.component"
import { ImgShimmerDirective } from "@app/directives/img-shimmer.directive"
import { GoogleMapsModule } from "@angular/google-maps"
import { MapsService } from "@services/maps.service"

export interface Priest {
  name: string
  image: string
  role: string
  residence: string
}

export interface ChurchAddress {
  main: string
  note?: string
  mapsUrl?: string
}

export interface MapMarker {
  lat: number
  lng: number
}

@Component ( {
  selector: "app-parish-info",
  imports: [ IconComponent, ImgShimmerDirective, GoogleMapsModule ],
  templateUrl: "./parish-info.component.html",
  styleUrl: "./parish-info.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ParishInfoComponent implements OnInit {
  public priests: InputSignal<Priest[]> = input<Priest[]> ( [] )
  public email: InputSignal<string> = input<string> ( "" )
  public phone: InputSignal<string> = input<string> ( "" )
  public address: InputSignal<ChurchAddress[]> = input<ChurchAddress[]> ( [] )
  public mapMarkers: InputSignal<MapMarker[]> = input<MapMarker[]> ( [] )
  public mapCenter: InputSignal<MapMarker | null> = input<MapMarker | null> ( null )
  public mapZoom: InputSignal<number> = input<number> ( 10 )

  public mapState: WritableSignal<{ loading: boolean; error: boolean }> = signal ( { loading: true, error: false } )

  private readonly mapsSvc: MapsService = inject ( MapsService )

  public ngOnInit ( ) {
    if ( this.mapMarkers ( ).length === 0 ) {
      this.mapState.set ( { loading: false, error: false } )
      return
    }
    this.mapsSvc.load ( ).then ( ( ) => {
      this.mapState.set ( { loading: false, error: false } )
    } ).catch ( ( ) => {
      this.mapState.set ( { loading: false, error: true } )
    } )
  }
}
