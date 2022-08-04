# Changelog `v4+`
All notable changes to this project on `v4+` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v4.0.0] - 2022-07-22
### Added
- Jest as default unit testing framework, with sample test suite for `main`.
- Integrated Electron preload pattern.
- NPM scripts:
  - `watch-test` to run Jest in watch mode.
  -  `next-rc`, `next-patch`, `next-minor` & `next-major` for quick
    package version number advance.

### Changed
- Webpack will now take the module path alias from `tsconfig.json` and set it
  for you thanks to `tsconfig-paths-webpack-plugin`. Manually set up in Webpack
  config is no longer needed.
- `tsconfig` now configured to use `ES2020` features, with module resolution
  set to `Node16` to match the NodeJS version used by Electron.
- Migrated to the new `createRoot` API introduced in React `v18`.
- Some APIs changed in Electron `main` entry script:
  - `mainWindow` now use `loadFile` API instead of `loadURL`.
  - Replaced `app.on('ready')` with `app.whenReady()` to align with syntax from
    [Electron official quick start guide](https://www.electronjs.org/docs/latest/tutorial/quick-start).
- `electron-builder` now configured to build `universal` `dmg` for mac, 32 &
  64 bit `exe` for Windows.
- Moved `electron-builder`, Webpack & Webpack-related packages to
  `optionalDependencies`.
- Revamped `README`.
- __*Starting from this version, the maintenance schedule will be on a monthly
  update basis to keep the package dependencies up to date and keep the
  development going.*__

### Fixed
- Allow to use `import default` statement on non ES modules (e.g. React,
  lodash) by enabling `esModuleInterop` in `tsconfig`.
  [#14](https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/issues/14)

### Removed
- Mocha in favour of Jest.
- Spectron as it ahs been deprecated. 
  *See - [Spectron Deprecation Notice](https://www.electronjs.org/blog/spectron-deprecation-notice)*

### Updates on package dependencies
### Added
- `@types/jest`, `jest`, `ts-jest`, `eslint-plugin-jest` *- Jest support*
- `eslint-config-airbnb-typescript` *- Enhance Airbnb's rules in TypeScript*
- `ts-config-paths-webpack-plugin` *- Load `tsconfig` path alias into Webpack
  config*

### Updated
- Major version updates:
  - `react` & `react-dom` - `17.0.1` -> `18.2.0`
  - `@types/react` - `17.0.0` -> `18.0.15`
  - `@types/react-dom` - `17.0.0` -> `18.0.6`
  - `@typescript-eslint/eslint-plugin` & `@typescript-eslint/parser` -
    `4.11.0` -> `5.30.7`
  - `electron` - `11.1.1` -> `19.0.9`
  - `eslint-config-airbnb` - `18.2.1` -> `19.0.4`
  - `copy-webpack-plugin` - `7.0.0` -> `11.0.0`
  - `css-loader` - `5.0.1` -> `6.7.1`
  - `electron-builder` - `22.9.1` -> `23.1.0`
  - `html-webpack-plugin` - `4.5.0` -> `5.5.0`
  - `style-loader` - `2.0.0` -> `3.3.1`
  - `ts-loader` - `8.0.12` -> `9.3.1`
  - `ts-config-paths` - `3.9.0` -> `4.0.0`
- Minor & patch version updates:
  - `eslint-import-resolver-webpack` - `0.13.0` -> `0.13.2`
  - `eslint-plugin-import` - `2.22.1` -> `2.26.0`
  - `eslint-plugin-jsx-a11y` - `6.4.1` -> `6.6.1`
  - `eslint-plugin-react` - `7.21.5` -> `7.30.1`
  - `eslint-plugin-react-hoots` - `4.2.0` -> `4.6.0`
  - `lodash` - `4.17.20` -> `4.17.21`
  - `webpack` - `5.11.0` -> `5.73.0`
  - `webpack-cli` - `4.3.0` -> `4.10.0`

### Removed
- `react-router`, `react-router-dom`, `@types/react-router`,
  `@types/react-router-dom`
  
  *\- Not being used in any part of the boilerplate*
- `@types/mocha`, `mocha`, `ts-node` *- Replaced by `@types/jest`, `jest` &
  `ts-jest`*
- `spectron` *- Deprecated package; No replacement*

[Unreleased]: https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/compare/v4.0.0...HEAD
[v4.0.0]: https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/compare/v3.0.0...v4.0.0
