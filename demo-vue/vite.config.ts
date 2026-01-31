import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import react from '@vitejs/plugin-react'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { transform } from 'esbuild'
import { createWorkspaceAliases } from '../config/workspace-aliases'

const reactDemoPattern = /src\/react-demos\//
const reactPackagePattern = /packages\/.*-react\//

function reactDemoTransformer() {
  return {
    name: 'react-demo-transform',
    enforce: 'pre' as const,
    async transform(code: string, id: string) {
      const matchesReactDir = reactDemoPattern.test(id) || reactPackagePattern.test(id)
      if (!matchesReactDir || !/\.[jt]sx?$/.test(id)) {
        return null
      }
      const loader = id.endsWith('.tsx') ? 'tsx' : 'ts'
      const result = await transform(code, {
        loader,
        jsx: 'automatic',
        jsxImportSource: 'react',
        sourcemap: true,
      })
      return { code: result.code, map: result.map }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    reactDemoTransformer(),
    vue(),
    vueJsx({
      exclude: [reactDemoPattern, reactPackagePattern],
    }),
    react(),
    vueDevTools(),
    tailwindcss(),
    
  ],
  server: {
    host: true,        // или "0.0.0.0"
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: createWorkspaceAliases(import.meta.url),
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
})
