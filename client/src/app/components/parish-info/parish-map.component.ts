import { ChangeDetectionStrategy, Component, input, InputSignal } from "@angular/core"
import { GoogleMapsModule } from "@angular/google-maps"

export interface MapMarker {
  lat: number
  lng: number
}

@Component ( {
  selector: "app-parish-map",
  imports: [ GoogleMapsModule ],
  templateUrl: "./parish-map.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class ParishMapComponent {
  public markers: InputSignal<MapMarker[]> = input<MapMarker[]> ( [] )
  public center: InputSignal<MapMarker | null> = input<MapMarker | null> ( null )
  public zoom: InputSignal<number> = input<number> ( 10 )
}
