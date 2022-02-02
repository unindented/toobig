## [3.4.0](https://github.com/unindented/toobig/compare/v3.3.2...v3.4.0) (2022-02-02)


### Features

* drop support for Node <14 ([#40](https://github.com/unindented/toobig/issues/40)) ([a6f6416](https://github.com/unindented/toobig/commit/a6f64161dfff61be31fceb585882c42d5e6466ec))
* update dev dependencies ([#39](https://github.com/unindented/toobig/issues/39)) ([8bc64c2](https://github.com/unindented/toobig/commit/8bc64c279d7da9baf46c16b1053e9c02b0bc12ed))

### [3.3.2](https://github.com/unindented/toobig/compare/v3.3.1...v3.3.2) (2020-07-10)


### Bug Fixes

* package.json & package-lock.json to reduce vulnerabilities ([#11](https://github.com/unindented/toobig/issues/11)) ([f91dce9](https://github.com/unindented/toobig/commit/f91dce9e8f059bf06c5ee028dd92ac149956059d))

### [3.3.1](https://github.com/unindented/toobig/compare/v3.3.0...v3.3.1) (2020-04-10)


### Bug Fixes

* fix filtering of table rows when `verbose: false` ([ff09709](https://github.com/unindented/toobig/commit/ff09709a12cdfe5656bbd5d03d3b67b24761912b))

## [3.3.0](https://github.com/unindented/toobig/compare/v3.2.0...v3.3.0) (2020-04-10)


### Features

* return whether any results were under or over the baseline results ([0e903ad](https://github.com/unindented/toobig/commit/0e903ad2ee9f26ff9cd91221fa07eb2387e6658b))

## [3.2.0](https://github.com/unindented/toobig/compare/v3.1.0...v3.2.0) (2020-04-10)


### Features

* allow reducing verbosity of table reporter ([b3d5361](https://github.com/unindented/toobig/commit/b3d5361c9badc570769cdabdfc12a8e6a36a549e))

## [3.1.0](https://github.com/unindented/toobig/compare/v3.0.1...v3.1.0) (2020-04-10)


### Features

* export types from main file ([a6cda47](https://github.com/unindented/toobig/commit/a6cda47eef1974adbafe38917ca2ead789c5512a))

### [3.0.1](https://github.com/unindented/toobig/compare/v3.0.0...v3.0.1) (2020-04-08)


### Bug Fixes

* add `string` as valid type for `baselines` config ([a5287fe](https://github.com/unindented/toobig/commit/a5287fe0380f03756b84df884a976345284c60a8))

## [3.0.0](https://github.com/unindented/toobig/compare/v2.0.0...v3.0.0) (2020-04-06)


### ⚠ BREAKING CHANGES

* Renamed `--input` flag to `--results`.

### Features

* allow comparison with baseline results ([0ddbf37](https://github.com/unindented/toobig/commit/0ddbf37cde2e4f420f0eebedabca8ae1b1c2e8ad))

## [2.0.0](https://github.com/unindented/toobig/compare/v1.0.1...v2.0.0) (2020-04-03)


### ⚠ BREAKING CHANGES

* Results format used to be an array, and is now an object keyed by path.

### Features

* avoid duplicate results by taking the one with the lower max size ([8345da2](https://github.com/unindented/toobig/commit/8345da2304042a16e3ea678b5c9547b3ba20a133))

### [1.0.1](https://github.com/unindented/toobig/compare/v1.0.0...v1.0.1) (2020-04-03)


### Bug Fixes

* do not throw when config file is not found ([11adda3](https://github.com/unindented/toobig/commit/11adda3788a1cc5c59a75721b0b8c649f9d4a517))

## 1.0.0 (2020-04-02)


### Features

* implement `scan` and `load` commands ([a27a660](https://github.com/unindented/toobig/commit/a27a66002b48716677519551d1f744b3962325d0))
