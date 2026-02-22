import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { Router, RouterModule, RouterOutlet } from "@angular/router"

@Component ( {
  selector: "app-root",
  imports: [
    RouterOutlet,
    RouterModule
  ],
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class AppComponent {
  public readonly router: Router = inject ( Router )
}
