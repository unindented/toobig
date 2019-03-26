# toobig

A simple utility to check file sizes against upper maximum budgets.

## Usage

```
Usage: cli.js [--config=<pathToConfigFile>] [--quiet] [--json=<pathToResultsFile>]

Options:
  --version  Show version number  [boolean]
  --config   Path to config file  [string]
  --quiet    Suppress standard output  [boolean]
  --json     Output results to a JSON file  [string]
  --help     Show help  [boolean]
```

## Running the tests

To run the tests: 

`npm run test`

To continuously watch the tests: 

`npm run watch:jest`

## Build

To build: 

`npm run build`

## License

MIT License

Copyright (c) 2019 Daniel Perez Alvarez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.