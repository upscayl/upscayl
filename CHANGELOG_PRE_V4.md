# Changelog (pre `v4`)
All notable changes up to `v3.0.0` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2020-12-26
### Added
- NPM packages `react-router` & `react-router-dom` to package dependencies.
- NPM package `eslint-plugin-react-hooks` to `devDependencies` as required by
  the updated version of `eslint-config-airbnb`.
- NPM package `copy-webpack-plugin` to `devDependencies` as replacement of
  `copy-pkg-json-webpack-plugin`.
- NPM packages `@typescript-eslint/eslint-plugin` & `@typescript-eslint/parser`
  to `devDependencies` for using ESLint to lint TypeScript.

### Changed
- __Project is now being developed based on Node.js `v14 (LTS)`.__
- Minor version upgrades on package dependencies:
  - `eslint-import-resolver-webpack` - `0.11.1` -> `0.13.0`
  - `eslint-plugin-import` - `2.18.2` -> `2.22.1`
  - `eslint-plugin-jsx-a11y` - `6.2.3` -> `6.4.1`
  - `eslint-plugin-react` - `7.17.0` -> ``7.21.5`
  - `lodash` - `4.17.15` -> `4.17.20`
- Major version upgrades on package dependencies:
  - `react` & `react-dom` - `16.12.0` -> `17.0.1`
  - `cross-env` - `5.2.1` -> `7.0.3`
  - `css-loader` - `1.0.1` -> `5.0.1`
  - `electron` - `3.1.13` -> `11.1.1`
  - `electron-builder` - `20.44.4` -> `22.9.1`
  - `eslint` - `5.16.0` -> `7.16.0`
  - `eslint-config-airbnb` - `17.1.1` -> `18.2.1`
  - `file-loader` - `2.0.0` -> `6.2.0`
  - `html-webpack-plugin` - `3.2.0` -> `4.5.0`
  - `mocha` - `5.2.0` -> `8.2.1`
  - `rimraf` - `2.7.1` -> `3.0.2`
  - `source-map-loader` - `0.2.4` -> `2.0.0`
  - `spectron` - `5.0.0` -> `13.0.0`
  - `style-loader` - `0.23.1` -> `2.0.0`
  - `ts-loader` - `5.4.5` -> `8.0.12`
  - `ts-node` - `7.0.1` -> `9.1.1`
  - `typescript` - `3.7.2` - > `4.1.3`
  - `webpack` - `4.41.2` -> `5.11.0`
  - `webpack-cli` - `3.3.10` -> `4.3.0`
- Moved `@types` packages from `dependencies` to `devDependencies` as those
  have no need to be included in production builds.
- Commands of NPM scripts `dev` & `prod` to make them work with Webpack 5.
- Migrated to ESLint from TSLint.
- Updated prefix of internal paths from `@` to `_` to avoid confusions with
  scoped NPM packages.
- Indentation for `.ts` files is now set as `2` spaces instead of `4`.
- `electron-builder` settings:
  - `win`:
    - Enabled `asar`. _(turn it off if the executable built doesn't work)_
    - Disabled one click installer.
    - Allowed custom installation directory in the installer built.
  - `mac`:
    - Changed build target back to `dmg`.
  - `buildVersion` is now being used as build number instead of just another
    parameter for semantic version number.
- Updated section `Known issues` in `README`.

### Fixed
- ESLint errors/warnings on `main.ts` & `renderer.tsx`.
- `electron-builder` fails to build `dmg` on `macOS` (issue 
  [electron-builder #3990])by upgrading the package version to `> 21.2.0`.

### Removed
- NPM package `copy-pkg-json-webpack-plugin` as it doesn't work with Webpack 5
  and seems not very well maintained.
- NPM packages `acorn` & `ajv` from `devDependencies` as they're not being used
  in this boilerplate.
- NPM packages `tslint` & `tslint-microsoft-contrib` as TSLint is now
  deprecated.

## [2.0.2] - 2019-12-02
`v2.0.2` is a minor hotfix release fixed the documentation error and build 
error on `macOS Catalina(10.15+)`.

### Added
- Extended README section `Getting started` with `npm start` command 
  description.
- README section `Known issue`.

### Changed
- Minor version upgrades on package dependencies.
- `macOS` build target to `pkg` from default `dmg` due to no 32-bit apps 
  support from `macOS Catalina` that caused `electron-builder` fails to build 
  `dmg` image on `macOS` prior to `electron-builder@21.2.0`.  
  _`pkg` build is unaffected and is used as a workaround for the current version 
  prior to the major version upgrades on dependencies in next release._  
  _Related issue: [electron-builder #3990](https://github.com/electron-userland/electron-builder/issues/3990)_

### Fixed
- [Issue #2] - incorrect command `npm run install` to `npm install` in `README`.

## [2.0.1] - 2018-02-05
`v2.0.1` is a minor hotfix release patched the `NODE_ENV` not set on Windows 
issue.

### Added
- Package `cross-env` as `devDependencies`.
- README section "Author".

### Fixed
- NPM scripts won't set environment variables on Windows issue.

## 2.0.0 - 2018-02-04
`v2.0.0` is a major release that most part of the boilerplate has been rewritten.

### Added
- ESLint for code checking on Javascript files.
- Airbnb's extensible `.eslintrc` package & its' peer dependencies. 
- `.eslintrc` that extends Airbnb's config and has customised rules configured.
  - _Rule `no-default-export` is set for JavaScript files to align with
    TypeScript._
- ESLint plugin `eslint-import-resolver-webpack` for ESLint to resolve path
  aliases set in Webpack config.
- Webpack plugin `copy-pkg-json-webpack-plugin` to generate a `package.json` 
  file and pack into Webpack's bundled package for production.
- Build commands `build:mac` & `build:win` to package & build the installer of 
  your Electron app for macOS & Windows using `electron-builder`.
- README section "Building the installer for your Electron app" & sub-section 
  "Extra options".

### Changed
- Refactored Webpack config file to have `mainConfig` & `rendererConfig` 
  cleaned up, and set mode by environment variable.
- `.gitignore` to ignore folder `out/` which will be auto-generated during the 
  build process.
- README section "How does it work?" is now renamed to "Getting started" & 
  completed the documentation of this section.
- README section "Folder structure" to reflect the changes in `v2.0.0`.

### Fixed
- CSS files fail to inject into views issue by setting Webpack to use 
  `style-loader` alongside with `css-loader` to bundle the files in Webpack 
  config file.
- `baseUrl` in `tsconfig.json` points to root directory incorrectly issue. 
  Corrected to current directory so VSCode can resolves the path aliases 
  correctly.

### Removed
- Redux & React-Redux related settings, including packages listed on 
`devDependencies`, path aliases & folders listed in folder structure.
  - Since Electron's built-in IPC & basic React states should be enough to get 
    the works done, and most Electron apps which have their application logic 
    runs on Electron's `main` process rather then `renderer` process actually 
    don't need React-Redux, `redux` & `react-redux` are no longer included in 
    this boilerplate.
  - Redux & React-Redux can still be used on this boilerplate by installing the 
    package yourself. For details, please refer to the corresponding library's 
    documents, there's no different than working on any other project which 
    isn't based on this boilerplate.
- Separated Webpack config files for `development` & `production` mode.

[Unreleased]: https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/compare/v3.0.0...HEAD
[2.0.1]: https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/compare/v2.0.0...v2.0.1
[2.0.2]: https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/compare/v2.0.1...v2.0.2
[3.0.0]: https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/compare/v2.0.2...v3.0.0

[Issue #2]: https://github.com/Devtography/electron-react-typescript-webpack-boilerplate/issues/2
[electron-builder #3990]: https://github.com/electron-userland/electron-builder/issues/3990
