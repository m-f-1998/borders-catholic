
import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from "@angular/core"
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
  public currentPage: InputSignal<string> = input<string> ( "" )
  public churchName: InputSignal<string> = input<string> ( "" )

  public isNavbarCollapsed = true

  public readonly router: Router = inject ( Router )

  public scrollTo ( id: string ) {
    const element = document.getElementById ( id )
    if ( element ) {
      element.scrollIntoView ( )
    }
  }
}
