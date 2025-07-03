import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { Router, RouterModule, RouterOutlet } from "@angular/router"

@Component ( {
  selector: "app-root",
  imports: [
    RouterOutlet,
    RouterModule
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class AppComponent {
  public router: Router = inject ( Router )
}
