import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Firebase Hosting serves this app from the domain root (jbeercrawl.web.app),
  // unlike GitHub Pages' /jbeercrawl/ subpath.
  base: '/',
})
