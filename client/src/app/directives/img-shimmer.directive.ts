import { AfterViewInit, Directive, ElementRef, HostListener, inject } from "@angular/core"

@Directive ( {
  selector: "img[appShimmer]",
  standalone: true
} )
export class ImgShimmerDirective implements AfterViewInit {
  private el = inject ( ElementRef<HTMLImageElement> )

  @HostListener ( "load" )
  @HostListener ( "error" )
  onLoad ( ) {
    this.el.nativeElement.classList.remove ( "shimmer-loading" )
  }

  ngAfterViewInit ( ) {
    const img = this.el.nativeElement
    if ( img.complete && img.naturalWidth > 0 ) return
    img.classList.add ( "shimmer-loading" )
  }
}
