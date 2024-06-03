import esbuild from 'esbuild'
import process from 'process'

const build = {
  all: process.argv.includes('--all'),
  main: process.argv.includes('--main'),
  preload: process.argv.includes('--preload'),
  renderer: process.argv.includes('--renderer'),
}

await Promise.all([
  (build.main || build.all) && esbuild.build({
    bundle: true,
    entryPoints: ['src/electron/main/index.ts'],
    external: ['electron'],
    logLevel: 'info',
    outfile: 'build/distrust.js',
    platform: 'node',
  }),
  (build.preload || build.all) && esbuild.build({
    bundle: true,
    entryPoints: ['src/electron/preload/index.ts'],
    external: ['electron'],
    logLevel: 'info',
    outfile: 'build/preload.min.js',
    platform: 'node',
  }),
  (build.renderer || build.all) && esbuild.build({
    bundle: true,
    entryPoints: ['src/distrust/index.tsx'],
    external: ['electron'],
    logLevel: 'info',
    outfile: 'build/renderer.min.js',
    platform: 'browser',
    format: 'esm',
  }),
])
