
import { ChangeDetectionStrategy, Component } from "@angular/core"

@Component ( {
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class FooterComponent {
  public copyrightNotice ( ) {
    const year = new Date ( ).getFullYear ( )
    return `© ${year}. All Rights Reserved.`
  }
}
