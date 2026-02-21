
import { ChangeDetectionStrategy, Component } from "@angular/core"
import { IconComponent } from "app/icon/icon.component"

@Component ( {
  selector: "app-footer",
  imports: [
    IconComponent
  ],
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class FooterComponent {
  public currentDate = new Date ( )

  public copyrightNotice ( ) {
    const year = new Date ( ).getFullYear ( )
    return `© ${year}. All rights reserved.`
  }

  public goToAuthor ( ) {
    window.location.href = "https://matthewfrankland.co.uk"
  }
}
