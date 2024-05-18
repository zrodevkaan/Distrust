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
    outfile: 'build/distrust.js',
    platform: 'node',
  }),
  (build.preload || build.all) && esbuild.build({
    bundle: true,
    entryPoints: ['src/electron/preload/index.ts'],
    external: ['electron'],
    outfile: 'build/preload.min.js',
    platform: 'node',
  }),
  (build.renderer || build.all) && esbuild.build({
    bundle: true,
    entryPoints: ['src/distrust/index.ts'],
    external: ['electron'],
    outfile: 'build/distrust.min.js',
    platform: 'node',
  }),
])