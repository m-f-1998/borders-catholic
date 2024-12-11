import { ChangeDetectionStrategy, Component } from "@angular/core"
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
  constructor (
    public router: Router
  ) { }
}
