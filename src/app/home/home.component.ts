import { Component } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap'
import { ExpandedImageComponent } from '../components/expanded-image/expanded-image.component'
import { faChurch, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FaIconComponent } from '@fortawesome/angular-fontawesome'
import { SundayMassTimesComponent } from '../components/sunday-mass-times/sunday-mass-times.component'
import { HeaderComponent } from '../components/header/header.component'
import { PriestsComponent } from '../components/priests/priests.component'
import { ContactComponent } from '../components/contact/contact.component'
import { FooterComponent } from '../components/footer/footer.component'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-hawick-home',
  standalone: true,
  imports: [
    GoogleMapsModule,
    ExpandedImageComponent,
    NgbModalModule,
    SundayMassTimesComponent,
    HeaderComponent,
    PriestsComponent,
    ContactComponent,
    FooterComponent,
    FaIconComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
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
  public faLoading = faSpinner
  public newsletterLoading = false

  constructor (
    private modalSvc: NgbModal,
    private httpClient: HttpClient
  ) { }

  public expandImage ( index: number ) {
    const reference = this.modalSvc.open ( ExpandedImageComponent, { size: 'lg', centered: true } )
    reference.componentInstance.imageURLs = this.images
    reference.componentInstance.index = index
  }

  private getID ( id: string, folderName: string ) {
    return new Promise<string> ( ( resolve ) => {
      this.httpClient.get ( `https://www.googleapis.com/drive/v3/files?key=AIzaSyALY_aYqEMGP6CChumMDc9sLJ1X8e4q6Dg&q=%27${id}%27%20in%20parents` ).subscribe ( ( response: any ) => {
        resolve ( response.files.find ( ( x: any ) => x.name === folderName ).id )
      } )
    } )
  }

  private getFiles ( id: string ): any {
    return new Promise<string> ( ( resolve ) => {
      this.httpClient.get ( `https://www.googleapis.com/drive/v3/files?key=AIzaSyALY_aYqEMGP6CChumMDc9sLJ1X8e4q6Dg&q=%27${id}%27%20in%20parents` ).subscribe ( ( response: any ) => {
        resolve ( response.files )
      } )
    } )
  }

  private getPreviousSunday ( ) {
    const today = new Date ( )
    const daysSinceSunday = today.getDay ( )

    const previousSunday = new Date ( today )

    if ( today.getDay ( ) === 6 ) {
      previousSunday.setDate ( today.getDate ( ) + 1 )
    } else {
      previousSunday.setDate ( today.getDate ( ) - daysSinceSunday )
    }
    const year = previousSunday.getFullYear ( )
    const month = String ( previousSunday.getMonth ( ) + 1 ).padStart ( 2, "0" )
    const day = String ( previousSunday.getDate ( ) ).padStart ( 2, "0" )

    return `${year}-${month}-${day}`
  }

  private debounceTimeout: NodeJS.Timeout | undefined
  private lastCalled = 0
  private rateLimit = 5000
  private debounce = ( func: any, delay: any ) => {
    clearTimeout ( this.debounceTimeout )
    this.debounceTimeout = setTimeout ( func, delay )
  }

  public getFolder ( ) {
    return new Promise<string> ( ( resolve ) => {
      if ( Date.now ( ) - this.lastCalled >= this.rateLimit ) {
        this.lastCalled = Date.now ( )
        this.debounce ( async ( ) => {
          let skip = false
          if ( !localStorage.getItem ( 'year' ) || !localStorage.getItem ( 'month' ) ) {
            skip = true
          }
          // TODO: Delete Below on Next Update
          if ( !skip && localStorage.getItem ( 'year' ) === "2024" && localStorage.getItem ( 'month' ) == "July" ) {
            skip = true
          }
          let yearID = localStorage.getItem ( 'newsletters_year' )
          const yearChange = !skip && localStorage.getItem ( 'year' ) === new Date ( ).getFullYear ( ).toString ( )
          if ( skip || !yearID || yearChange ) {
            yearID = await this.getID ( "1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG", new Date ( ).getFullYear ( ).toString ( ) )
            localStorage.setItem ( 'newsletters_year', yearID as string )
            localStorage.setItem ( 'year', new Date ( ).getFullYear ( ).toString ( ) )
          }

          let monthID = localStorage.getItem ( 'newsletters_month' )
          const monthChange = !skip && localStorage.getItem ( 'month' ) === new Date ( ).toLocaleString ( 'default', { month: 'long' } )
          if ( skip || !monthID || monthChange ) {
            const monthNum2Dig = ( num: number ) => num < 10 ? `0${num}` : num
            const monthName = new Date ( ).toLocaleString ( 'default', { month: 'long' } )
            const folderName = `${monthNum2Dig(new Date().getMonth() + 1)} - ${monthName}`
            monthID = await this.getID ( yearID, folderName )
            localStorage.setItem ( 'newsletters_month', monthID as string )
            localStorage.setItem ( 'month', monthName )
          }

          const files = await this.getFiles ( monthID )
          const date = this.getPreviousSunday ( )
          const pdf = files.find ( ( x: any ) => x.name === date + ".pdf" )

          if ( pdf ) {
            resolve ( `https://drive.google.com/file/d/${pdf.id}/view` )
          } else {
            resolve ( "https://drive.google.com/drive/folders/1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG" )
          }
        }, 100 )
      } else {
        resolve ( "https://drive.google.com/drive/folders/1tElBwGIR2-0bABeD90RZDdAwoJ77mZMG" )
      }
    } )
  }

  public openNewsletter ( ) {
    this.newsletterLoading = true
    this.getFolder ( ).then ( ( url: string ) => {
      window.location.href = url
      this.newsletterLoading = false
    } ).catch ( e => {
      console.error ( e )
      this.newsletterLoading = false
    } )
  }
}
