import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal, WritableSignal } from "@angular/core"
import { ExpandedImageComponent } from "@components/expanded-image/expanded-image.component"
import { SundayMassTimesComponent } from "@components/sunday-mass-times/sunday-mass-times.component"
import { HeaderComponent } from "@components/header/header.component"
import { ParishInfoComponent } from "@components/parish-info/parish-info.component"
import { SacramentsSectionComponent } from "@components/sacraments-section/sacraments-section.component"
import { FooterComponent } from "@components/footer/footer.component"
import { ApiService } from "@services/api.service"
import { IconComponent } from "@app/icon/icon.component"
import { ImgShimmerDirective } from "@app/directives/img-shimmer.directive"

@Component ( {
  selector: "app-hawick-home",
  imports: [
    ExpandedImageComponent,
    SundayMassTimesComponent,
    HeaderComponent,
    ParishInfoComponent,
    SacramentsSectionComponent,
    FooterComponent,
    IconComponent,
    ImgShimmerDirective
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class HomeComponent {
  public readonly GalleryLimit = 8

  public readonly images: string[] = [
    "parish/parish-1.jpg",
    "parish/parish-2.jpg",
    "highlight.jpg",
    "parish/parish-10.jpg",
    "parish/parish-9.jpg",
    "parish/parish-8.jpg",
    "parish/parish-6.jpg",
    "parish/parish-5.jpg",
    "parish/parish-4.jpg",
    "parish/parish-7.jpg",
    "parish/parish-3.jpg"
  ]

  public loadingNewsletter: WritableSignal<boolean> = signal ( false )
  public expandedImageIndex: WritableSignal<number | null> = signal ( null )
  public showAllGallery: WritableSignal<boolean> = signal ( false )
  public visibleImages = computed ( ( ) =>
    this.showAllGallery ( ) ? this.images : this.images.slice ( 0, this.GalleryLimit )
  )

  private newsletterUrl: string | null = null
  private newsletterRequest: Promise<string | null> | null = null
  private readonly archiveUrl = "https://drive.google.com/drive/folders/1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG"
  private readonly apiSvc: ApiService = inject ( ApiService )

  public constructor ( ) {
    afterNextRender ( ( ) => {
      void this.fetchNewsletter ( ).catch ( ( ) => undefined )
    } )
  }

  public expandImage ( index: number ) {
    this.expandedImageIndex.set ( index )
  }

  public openNewsletter ( ) {
    if ( this.newsletterUrl ) {
      window.open ( this.newsletterUrl, "_blank", "noopener,noreferrer" )
      return
    }

    // Open the tab inside the click. Waiting for Drive first makes the browser drop the popup.
    const popup = window.open ( "", "_blank" )
    void this.revealNewsletter ( popup )
  }

  public openNewsletterArchive ( ) {
    window.open ( this.archiveUrl, "_blank", "noopener,noreferrer" )
  }

  private async revealNewsletter ( popup: Window | null ) {
    this.loadingNewsletter.set ( true )
    try {
      const url = await this.fetchNewsletter ( ) ?? this.archiveUrl
      this.navigate ( popup, url )
    } catch ( error ) {
      console.error ( "Error fetching newsletter link:", error )
      this.navigate ( popup, this.archiveUrl )
    } finally {
      this.loadingNewsletter.set ( false )
    }
  }

  private navigate ( popup: Window | null, url: string ) {
    if ( popup && !popup.closed ) {
      popup.location.replace ( url )
      popup.opener = null
      return
    }
    window.open ( url, "_blank", "noopener,noreferrer" )
  }

  private fetchNewsletter ( ): Promise<string | null> {
    if ( this.newsletterUrl ) return Promise.resolve ( this.newsletterUrl )
    if ( !this.newsletterRequest ) {
      this.newsletterRequest = this.apiSvc
        .get<{ url?: string; available?: boolean }> ( "/api/drive/newsletter" )
        .then ( response => {
          const url = response.url ?? null
          if ( response.available && url ) {
            this.newsletterUrl = url
            return url
          }
          this.newsletterRequest = null
          return url
        } )
        .catch ( error => {
          this.newsletterRequest = null
          throw error
        } )
    }
    return this.newsletterRequest
  }
}
