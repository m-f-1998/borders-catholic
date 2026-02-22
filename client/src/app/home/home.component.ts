import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from "@angular/core"
import { GoogleMapsModule } from "@angular/google-maps"
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap"
import { ExpandedImageComponent } from "@components/expanded-image/expanded-image.component"
import { SundayMassTimesComponent } from "@components/sunday-mass-times/sunday-mass-times.component"
import { HeaderComponent } from "@components/header/header.component"
import { PriestsComponent } from "@components/priests/priests.component"
import { ContactComponent } from "@components/contact/contact.component"
import { FooterComponent } from "@components/footer/footer.component"
import { ApiService } from "@services/api.service"
import { IconComponent } from "app/icon/icon.component"
import { MapsService } from "@services/maps.service"

@Component ( {
  selector: "app-hawick-home",
  imports: [
    GoogleMapsModule,
    NgbModalModule,
    SundayMassTimesComponent,
    HeaderComponent,
    PriestsComponent,
    ContactComponent,
    FooterComponent,
    IconComponent
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class HomeComponent implements OnInit {
  public markers: google.maps.LatLngLiteral [ ] = [
    { lat: 55.42120422298265, lng: -2.7917159397115743 },
    { lat: 55.48180084772263, lng: -2.5512490699400674 },
    { lat: 55.60262564955972, lng: -2.43991612928584 }
  ]
  public center: google.maps.LatLngLiteral = { lat: 55.48180084772263, lng: -2.5512490699400674 }
  public images: string [ ] = [
    "parish/parish-8.jpg",
    "parish/parish-6.jpg",
    "parish/parish-5.jpg",
    "parish/parish-4.jpg",
    "parish/parish-7.jpg",
    "parish/parish-3.jpg",
    "parish/parish-2.jpg",
    "parish/parish-1.jpg"
  ]

  public zoom = 10
  public mapState: WritableSignal<{ loading: boolean; error: boolean }> = signal ( { loading: true, error: false } )
  public loadingNewsletter: WritableSignal<boolean> = signal ( false )

  private readonly modalSvc: NgbModal = inject ( NgbModal )
  private readonly apiSvc: ApiService = inject ( ApiService )
  private readonly mapsSvc: MapsService = inject ( MapsService )

  public ngOnInit ( ) {
    this.mapsSvc.load ( ).then ( ( ) => {
      this.mapState.set ( { loading: false, error: false } )
    } ).catch ( error => {
      console.error ( "Error loading Google Maps:", error )
      this.mapState.set ( { loading: false, error: true } )
    } )
  }

  public expandImage ( index: number ) {
    const reference = this.modalSvc.open ( ExpandedImageComponent, { size: "lg", centered: true } )
    reference.componentInstance.imageURLs = this.images
    reference.componentInstance.index = index
  }

  public async openNewsletter ( ) {
    this.loadingNewsletter.set ( true )
    try {
      const response = ( await this.apiSvc.get ( "/api/drive/newsletter" ) ) as { url?: string }
      if ( response.url ) {
        window.location.href = response.url
      } else {
        this.openNewsletterArchive ( )
      }
    } catch ( error ) {
      console.error ( "Error fetching newsletter link:", error )
      this.openNewsletterArchive ( )
    } finally {
      this.loadingNewsletter.set ( false )
    }
  }

  public openNewsletterArchive ( ) {
    window.location.href = "https://drive.google.com/drive/folders/1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG"
  }
}
