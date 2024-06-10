import { Component } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { RouterModule } from '@angular/router'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ExpandedImageComponent } from '../../components/expanded-image/expanded-image.component'
import { faChurch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { SundayMassTimesComponent } from '../../components/sunday-mass-times/sunday-mass-times.component'
import { HeaderComponent } from '../../components/header/header.component'
import { PriestsComponent } from '../../components/priests/priests.component'
import { ContactComponent } from '../../components/contact/contact.component'
import { FooterComponent } from '../../components/footer/footer.component'

@Component({
  selector: 'app-hawick-home',
  standalone: true,
  imports: [
    RouterModule,
    GoogleMapsModule,
    ExpandedImageComponent,
    FontAwesomeModule,
    SundayMassTimesComponent,
    HeaderComponent,
    PriestsComponent,
    ContactComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HawickHomeComponent {
  public markers: google.maps.LatLngLiteral [ ] = [
    { lat: 55.42120422298265, lng: -2.7917159397115743 },
    { lat: 55.48180084772263, lng: -2.5512490699400674 },
    { lat: 55.60262564955972, lng: -2.43991612928584 }
  ]
  public center: google.maps.LatLngLiteral = { lat: 55.48180084772263, lng: -2.5512490699400674 }
  public images: string [ ] = [
    "/assets/img/hawick/parish-6.jpg",
    "/assets/img/hawick/parish-5.jpg",
    "/assets/img/hawick/parish-4.jpg",
    "/assets/img/hawick/parish-3.jpg",
    "/assets/img/hawick/parish-2.jpg",
    "/assets/img/hawick/parish-1.jpg"
  ]

  public zoom = 10
  public faChurch = faChurch

  constructor (
    private modalSvc: NgbModal
  ) { }

  public expandImage ( index: number ) {
    const reference = this.modalSvc.open ( ExpandedImageComponent, { size: 'lg', centered: true } )
    reference.componentInstance.imageURLs = this.images
    reference.componentInstance.index = index
  }
}
