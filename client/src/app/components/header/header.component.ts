
import { ChangeDetectionStrategy, Component, inject, Input } from "@angular/core"
import { Router, RouterModule } from "@angular/router"
import { NgbModule } from "@ng-bootstrap/ng-bootstrap"

@Component ( {
  selector: "app-header",
  imports: [
    RouterModule,
    NgbModule
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class HeaderComponent {
  @Input ( ) public currentPage: string = ""
  @Input ( ) public churchName: string = ""

  public isNavbarCollapsed = true

  public router: Router = inject ( Router )

  public scrollTo ( id: string ) {
    const element = document.getElementById ( id )
    if ( element ) {
      element.scrollIntoView ( )
    }
  }
}
