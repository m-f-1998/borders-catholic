import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-readmore',
  standalone: true,
  imports: [],
  templateUrl: './readmore.component.html',
  styleUrl: './readmore.component.scss'
})
export class ReadmoreComponent {

  @Input ( ) public subtitle?: string
  @Input ( ) public content: string = ""
  @Input ( ) public fileURL?: string
  @Input ( ) public fileName?: string
  @Input ( ) public expanded: boolean = false
  public MAXLENGTH: number = 400

  @Input ( ) public showReadMore = true

  public expand ( ) {
    this.expanded = !this.expanded
  }

  public getCutString ( ) {
    return this.content.substring ( 0, this.MAXLENGTH - 1 ) + "..."
  }

}
