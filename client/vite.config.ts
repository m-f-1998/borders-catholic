import { defineConfig } from "vite"

export default defineConfig ( {
  server: {
    fs: {
      allow: [
        "/Users/matthew-mac/GitHub/borders-catholic"
      ],
    },
  },
} )