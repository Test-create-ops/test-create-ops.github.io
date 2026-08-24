import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  base: '/',
  resolve: {
    alias: {
      // isomorphic-unzip: forziamo la variante browser (zip.js) invece
      // di quella Node (yauzl) che richiede moduli assenti nel browser.
      'isomorphic-unzip': resolve(
        __dirname,
        'node_modules/isomorphic-unzip/zip-browser.js',
      ),
    },
  },
  optimizeDeps: {
    include: ['app-info-parser'],
  },
})
