# toobig ⚖️

A simple utility to check file and directory sizes against a budget.

![Screenshot of `toobig` in action](docs/screenshot.png)

## Table of contents

- [Install](#install)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [CLI](#cli)
  - [Programmatic](#programmatic)
- [Build](#build)
- [Test](#test)
- [Meta](#meta)
- [Contributors](#contributors)
- [License](#license)

## Install

To install:

```
npm install toobig --save-dev
```

Or if you prefer using Yarn:

```
yarn add toobig --dev
```

## Usage

### Configuration

By default, `toobig` will search up the directory tree for configuration in the following places:

- a `toobig` property in `package.json`
- a `.toobigrc` file in JSON or YAML format
- a `.toobigrc.json` file
- a `.toobigrc.yaml`, `.toobigrc.yml`, or `.toobigrc.js` file
- a `toobig.config.js` file exporting a JS object

`toobig` continues to search up the directory tree, checking each of these places in each directory, until it finds some acceptable configuration (or hits the home directory).

Configuration looks like this:

```json
{
  "budgets": {
    "dist/*.entry.js": "16KB",
    "dist/*.lazy.js": "128KB"
  }
}
```

If you want to specify which reporters to use, it would look something like this:

```json
{
  "budgets": {
    "dist/*.entry.js": "16KB",
    "dist/*.lazy.js": "128KB"
  },
  "reporters": [
    "line",
    ["table", { "template": "markdown" }],
    "summary",
    ["json", { "output": "toobig-report.json" }],
    ["junit", { "output": "toobig-report.xml" }],
    ["tap", { "output": "toobig-report.txt" }]
  ]
```

#### `budgets`

`budgets` is a map where the keys are glob expressions, and the values are their corresponding budget. If any file or directory that matches a glob expression is bigger than its specified budget, `toobig` will exit with a non-zero status.

#### `reporters`

`reporters` is an array of reporters that will process results.

Built-in reporters are:

- `line`
- `table`
- `summary`
- `json`
- `junit`
- `tap`

### CLI

#### `scan [options]`

`scan` is the default command. It scans the current working directory to check for entries over budget, and reports them.

To get help:

```
toobig --help
```

To run:

```
toobig
```

To specify the location of the config file, instead of relying on the search logic described above:

```
toobig --config path/to/.toobigrc
```

To specify the reporters to use:

```
toobig --reporters json > toobig-report.json
```

To compare against the results of a previous run:

```
toobig --baselines toobig-previous.json --reporters table summary
```

#### `load [options]`

`load` allows you to load results from a previous run, and report them.

To get help:

```
toobig load --help
```

To run:

```
toobig load --results toobig-report.json
```

To specify the reporters to use:

```
toobig load --results toobig-report.json --reporters table summary
```

To compare against the results of a previous run:

```
toobig load --results toobig-report.json --baselines toobig-previous.json --reporters table summary
```

### Programmatic

#### `scanAndReport`

```js
import { scanAndReport } from "toobig";

const { results, anyOverBudget } = await scanAndReport({
  budgets: {
    "dist/*.entry.js": "16KB",
    "dist/*.lazy.js": "128KB",
  },
  reporters: [["json", { output: "toobig-report.json" }]],
});
```

#### `loadAndReport`

```js
import { loadAndReport } from "toobig";

const { results, anyOverBudget } = await loadAndReport({
  results: "toobig-report.json",
  reporters: [
    "default",
    ["junit", { output: "toobig-report.xml" }],
    ["tap", { output: "toobig-report.txt" }],
  ],
});
```

## Build

To build:

```
npm run build
```

To continuously build on changes:

```
npm run watch:build
```

## Test

To run linting and unit tests:

```
npm test
```

To run just unit tests:

```
npm run test:unit
```

To continuously run unit tests on changes:

```
npm run watch:unit
```

## Meta

- Code: `git clone git://github.com/unindented/toobig.git`
- Home: <https://github.com/unindented/toobig>

## Contributors

- Daniel Perez Alvarez (<https://github.com/unindented>)
- Dreadwail (<https://github.com/dreadwail>)

## License

This is free software, and may be redistributed under the terms specified in the LICENSE file.
