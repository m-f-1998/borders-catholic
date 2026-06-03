import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, output, signal, WritableSignal } from "@angular/core"
import { IconComponent } from "@app/icon/icon.component"

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

@Component ( {
  selector: "app-expanded-image",
  imports: [ IconComponent ],
  templateUrl: "./expanded-image.component.html",
  styleUrl: "./expanded-image.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(document:keydown.arrowleft)": "prevImage()",
    "(document:keydown.arrowright)": "nextImage()",
    "(document:keydown.escape)": "close()",
    "(document:keydown.tab)": "onTab($event)",
    "(document:keydown.shift.tab)": "onShiftTab($event)"
  }
} )
export class ExpandedImageComponent implements OnInit, AfterViewInit {
  public readonly index = input.required<number> ( )
  public readonly imageURLs = input<string[]> ( [] )
  public readonly closed = output<void> ( )

  public currentIndex: WritableSignal<number> = signal ( 0 )

  private readonly elRef = inject ( ElementRef<HTMLElement> )

  public ngOnInit ( ) { this.currentIndex.set ( this.index ( ) ) }

  public ngAfterViewInit ( ) {
    // Move focus into the dialog on open
    const first = this.getFocusable ( ) [ 0 ]
    first?.focus ( )
  }

  public imgSrc ( url: string, w: number ): string {
    return `/api/img/${url}?w=${w}&f=webp`
  }

  public imgSrcset ( url: string ): string {
    return `/api/img/${url}?w=320&f=webp 320w, /api/img/${url}?w=640&f=webp 640w, /api/img/${url}?w=1024&f=webp 1024w`
  }

  public close ( ) { this.closed.emit ( ) }

  public nextImage ( ) {
    this.currentIndex.update ( i => i === this.imageURLs ( ).length - 1 ? 0 : i + 1 )
  }

  public prevImage ( ) {
    this.currentIndex.update ( i => i === 0 ? this.imageURLs ( ).length - 1 : i - 1 )
  }

  public onTab ( event: Event ) {
    this.trapFocus ( event as KeyboardEvent, false )
  }

  public onShiftTab ( event: Event ) {
    this.trapFocus ( event as KeyboardEvent, true )
  }

  private getFocusable ( ): HTMLElement[] {
    return Array.from ( this.elRef.nativeElement.querySelectorAll ( FOCUSABLE_SELECTOR ) ) as HTMLElement[]
  }

  private trapFocus ( event: KeyboardEvent, reverse: boolean ) {
    const focusable = this.getFocusable ( )
    if ( focusable.length === 0 ) return
    const first = focusable [ 0 ]
    const last = focusable [ focusable.length - 1 ]
    const active = document.activeElement
    if ( reverse ) {
      if ( active === first ) {
        event.preventDefault ( )
        last.focus ( )
      }
    } else {
      if ( active === last ) {
        event.preventDefault ( )
        first.focus ( )
      }
    }
  }
}
