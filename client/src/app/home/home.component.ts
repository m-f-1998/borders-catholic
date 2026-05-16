import { ChangeDetectionStrategy, Component, computed, inject, signal, WritableSignal } from "@angular/core"
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

  private readonly apiSvc: ApiService = inject ( ApiService )

  public expandImage ( index: number ) {
    this.expandedImageIndex.set ( index )
  }

  public async openNewsletter ( ) {
    this.loadingNewsletter.set ( true )
    try {
      const response = ( await this.apiSvc.get ( "/api/drive/newsletter" ) ) as { url?: string }
      if ( response.url ) {
        window.open ( response.url, "_blank", "noopener,noreferrer" )
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
    window.open ( "https://drive.google.com/drive/folders/1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG", "_blank", "noopener,noreferrer" )
  }
}
