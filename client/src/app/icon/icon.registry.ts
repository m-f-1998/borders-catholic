import {
  faChurch,
  faEnvelope,
  faEnvelopeOpen,
  faExclamationTriangle,
  faGlobe,
  faHome,
  faMapPin,
  faMobileAlt,
  faPhone,
  faSpinner
} from "@fortawesome/free-solid-svg-icons"
import { faFacebook, faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons"

const icons = {
  "fas": {
    "church": faChurch,
    "envelope": faEnvelope,
    "envelope-open": faEnvelopeOpen,
    "exclamation-triangle": faExclamationTriangle,
    "globe": faGlobe,
    "home": faHome,
    "map-pin": faMapPin,
    "mobile-alt": faMobileAlt,
    "phone": faPhone,
    "spinner": faSpinner
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