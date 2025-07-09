import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core"
import { GoogleMapsModule } from "@angular/google-maps"
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap"
import { ExpandedImageComponent } from "@components/expanded-image/expanded-image.component"
import { FaIconComponent } from "@fortawesome/angular-fontawesome"
import { SundayMassTimesComponent } from "@components/sunday-mass-times/sunday-mass-times.component"
import { HeaderComponent } from "@components/header/header.component"
import { PriestsComponent } from "@components/priests/priests.component"
import { ContactComponent } from "@components/contact/contact.component"
import { FooterComponent } from "@components/footer/footer.component"
import { ApiService } from "@services/api.service"
import { IconService } from "@services/icons.service"

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
    FaIconComponent
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class HomeComponent {
  public markers: google.maps.LatLngLiteral [ ] = [
    { lat: 55.42120422298265, lng: -2.7917159397115743 },
    { lat: 55.48180084772263, lng: -2.5512490699400674 },
    { lat: 55.60262564955972, lng: -2.43991612928584 }
  ]
  public center: google.maps.LatLngLiteral = { lat: 55.48180084772263, lng: -2.5512490699400674 }
  public images: string [ ] = [
    "/assets/img/parish/parish-8.jpg",
    "/assets/img/parish/parish-6.jpg",
    "/assets/img/parish/parish-5.jpg",
    "/assets/img/parish/parish-4.jpg",
    "/assets/img/parish/parish-7.jpg",
    "/assets/img/parish/parish-3.jpg",
    "/assets/img/parish/parish-2.jpg",
    "/assets/img/parish/parish-1.jpg"
  ]

  public zoom = 10
  public loading = signal ( false )

  public readonly iconSvc: IconService = inject ( IconService )
  private readonly modalSvc: NgbModal = inject ( NgbModal )
  private readonly apiSvc: ApiService = inject ( ApiService )

  public expandImage ( index: number ) {
    const reference = this.modalSvc.open ( ExpandedImageComponent, { size: "lg", centered: true } )
    reference.componentInstance.imageURLs = this.images
    reference.componentInstance.index = index
  }

  public async openNewsletter ( ) {
    this.loading.set ( true )
    try {
      await this.getNewsletterLink ( )
    } catch ( e ) {
      console.error ( e )
    } finally {
      this.loading.set ( false )
    }
  }

  public openNewsletterArchive ( ) {
    window.location.href = "https://drive.google.com/drive/folders/1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG"
  }

  private async getNewsletterLink ( ) {
    try {
      const response: any = await this.apiSvc.get ( "/api/newsletter" )
      if ( response.url ) {
        window.location.href = response.url
      } else {
        this.openNewsletterArchive ( )
      }
    } catch ( error ) {
      console.error ( "Error fetching newsletter link:", error )
      this.openNewsletterArchive ( )
    }
  }
}
