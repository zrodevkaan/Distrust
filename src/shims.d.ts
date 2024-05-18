import type { Electron } from 'standalone-electron-types'

declare type Electron = Electron

interface NodeRequireFunction {
  (moduleName: 'electron'): typeof Electron.CrossProcessExports;
  (moduleName: 'electron/main'): typeof Electron.Main;
  (moduleName: 'electron/common'): typeof Electron.Common;
  (moduleName: 'electron/renderer'): typeof Electron.Renderer;
}

interface NodeRequire {
  (moduleName: 'electron'): typeof Electron.CrossProcessExports;
  (moduleName: 'electron/main'): typeof Electron.Main;
  (moduleName: 'electron/common'): typeof Electron.Common;
  (moduleName: 'electron/renderer'): typeof Electron.Renderer;
}