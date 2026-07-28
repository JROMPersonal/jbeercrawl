import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this repo at https://<user>.github.io/jbeercrawl/,
  // so all built asset URLs need that path prefix. Update this if the repo
  // is ever renamed.
  base: '/jbeercrawl/',
})
