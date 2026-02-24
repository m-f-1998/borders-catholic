import { ChangeDetectionStrategy, Component, input, InputSignal, OnInit, signal, WritableSignal } from "@angular/core"
import { AnimationProp, FaIconComponent } from "@fortawesome/angular-fontawesome"
import { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core"
import { BrandIcon, getIcon, SolidIcon } from "./icon.registry"

@Component ( {
  selector: "app-icon",
  imports: [
    FaIconComponent
  ],
  templateUrl: "./icon.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
} )
export class IconComponent implements OnInit {
  public icon: InputSignal<SolidIcon | BrandIcon> = input.required ( )
  public iconAnimation: InputSignal<AnimationProp | undefined> = input<AnimationProp | undefined> ( )
  public iconSize: InputSignal<SizeProp | undefined> = input<SizeProp | undefined> ( )
  public fixedWidth: InputSignal<boolean> = input<boolean> ( false )

  public iconProp: WritableSignal<IconProp | undefined> = signal ( undefined )

  public ngOnInit ( ) {
    this.iconProp.set ( getIcon ( this.icon ( ) ) )
  }
}