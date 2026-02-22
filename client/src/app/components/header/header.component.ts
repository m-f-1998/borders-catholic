
import { ChangeDetectionStrategy, Component, inject, input, InputSignal, signal, WritableSignal } from "@angular/core"
import { Router, RouterModule } from "@angular/router"
import { NgbCollapse } from "@ng-bootstrap/ng-bootstrap/collapse"

@Component ( {
  selector: "app-header",
  imports: [
    RouterModule,
    NgbCollapse
  ],
  templateUrl: "./header.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class HeaderComponent {
  public currentPage: InputSignal<string> = input<string> ( "" )

  public isMenuCollapsed: WritableSignal<boolean> = signal ( true )

  public readonly router: Router = inject ( Router )

  public goTo ( routerLink: string = "", id?: string ) {
    this.isMenuCollapsed.set ( true )
    this.router.navigate ( [ routerLink ], id ? { fragment: id } : undefined )
  }

  public toggleMenu ( ) {
    this.isMenuCollapsed.set ( !this.isMenuCollapsed ( ) )
  }
}
