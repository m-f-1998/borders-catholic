
import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { IconService } from "@services/icons.service"

@Component ( {
  selector: "app-footer",
  imports: [
    FontAwesomeModule
  ],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class FooterComponent {
  public currentDate = new Date ( )

  public readonly iconSvc: IconService = inject ( IconService )

  public copyrightNotice ( ) {
    const year = new Date ( ).getFullYear ( )
    return `© ${year}. All rights reserved.`
  }

  public goToAuthor ( ) {
    window.location.href = "https://matthewfrankland.co.uk"
  }
}
