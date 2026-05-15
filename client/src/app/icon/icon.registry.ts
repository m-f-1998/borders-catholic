import {
  faCalendar,
  faBars,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChurch,
  faCross,
  faDroplet,
  faEnvelope,
  faEnvelopeOpen,
  faExclamationTriangle,
  faGlobe,
  faHandsPraying,
  faHome,
  faImages,
  faMapPin,
  faMobileAlt,
  faPhone,
  faRing,
  faSpinner
} from "@fortawesome/free-solid-svg-icons"
import { faFacebook, faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons"

const icons = {
  "fas": {
    "bars": faBars,
    "chevron-down": faChevronDown,
    "chevron-left": faChevronLeft,
    "chevron-right": faChevronRight,
    "church": faChurch,
    "cross": faCross,
    "droplet": faDroplet,
    "envelope": faEnvelope,
    "envelope-open": faEnvelopeOpen,
    "exclamation-triangle": faExclamationTriangle,
    "globe": faGlobe,
    "hands-praying": faHandsPraying,
    "home": faHome,
    "images": faImages,
    "map-pin": faMapPin,
    "mobile-alt": faMobileAlt,
    "phone": faPhone,
    "ring": faRing,
    "spinner": faSpinner,
    "calendar": faCalendar
  },
  "fab": {
    "facebook": faFacebook,
    "github": faGithub,
    "linkedin": faLinkedin
  }
}

export const getIcon = ( icon: SolidIcon | BrandIcon ) => {
  if ( icon in icons.fas ) {
    return icons.fas [ icon as SolidIcon ]
  } else if ( icon in icons.fab ) {
    return icons.fab [ icon as BrandIcon ]
  } else {
    console.warn ( `Icon not found: ${icon}` )
    return icons.fas [ "exclamation-triangle" as SolidIcon ]
  }
}

export type BrandIcon = keyof typeof icons.fab
export type SolidIcon = keyof typeof icons.fas