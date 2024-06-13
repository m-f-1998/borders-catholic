import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ReadmoreComponent } from '../components/readmore/readmore.component'
import { HeaderComponent } from '../components/header/header.component'
import { PriestsComponent } from '../components/priests/priests.component'
import { ContactComponent } from '../components/contact/contact.component'
import { FooterComponent } from '../components/footer/footer.component'

@Component({
  selector: 'app-hawick-sacraments',
  standalone: true,
  imports: [
    RouterModule,
    ReadmoreComponent,
    HeaderComponent,
    PriestsComponent,
    ContactComponent,
    FooterComponent
  ],
  templateUrl: './sacraments.component.html',
  styleUrl: './sacraments.component.scss'
})
export class SacramentsComponent {
  public currentDate = new Date()
}
