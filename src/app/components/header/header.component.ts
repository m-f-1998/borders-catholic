import { CommonModule } from "@angular/common"
import { ChangeDetectionStrategy, Component, Input} from "@angular/core"
import { Router, RouterModule } from "@angular/router"
import { NgbModule } from "@ng-bootstrap/ng-bootstrap"

@Component ( {
  selector: "app-header",
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    NgbModule,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class HeaderComponent {

  public isNavbarCollapsed = true
  @Input ( ) public currentPage: string = ""
  @Input ( ) public churchName: string = ""

  constructor (
    public router: Router
  ) { }

  public scrollTo ( id: string ) {
    const element = document.getElementById ( id )
    if ( element ) {
      element.scrollIntoView ( )
    }
  }
}
