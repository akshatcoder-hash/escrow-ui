import { Plugin } from 'vite'
import * as nodePath from 'path'

const builtins = {
  buffer: 'node_modules/buffer/index.js',
  process: 'node_modules/process/browser.js',
}

export default function nodePolyfills(): Plugin {
  const resolved = new Map<string, string>()

  return {
    name: 'node-polyfills',
    resolveId(id, importer) {
      if (id in builtins) {
        return { id: nodePath.resolve(builtins[id as keyof typeof builtins]), moduleSideEffects: true }
      }
      if (importer && (id.startsWith('node:') || (importer.includes('node_modules') && id.startsWith('.')))) {
        const resolvedId = nodePath.resolve(nodePath.dirname(importer), id)
        if (!resolved.has(resolvedId)) {
          resolved.set(resolvedId, resolvedId)
        }
        return { id: resolved.get(resolvedId)!, moduleSideEffects: true }
      }
    },
    load(id) {
      if (resolved.has(id)) {
        return `export default {}`
      }
    },
  }
}