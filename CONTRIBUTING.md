# Contributing Guide

Contributions are welcome and greatly appreciated! Every little bit helps, and credit will
always be given.

Note: This project is a modern TypeScript rewrite and maintenance of the original
`tcomb-form-native` by Giulio Canti. We keep the legacy API shape but modernize the codebase and docs.

## Issues Request Guidelines

Before you submit an issue, check that it meets these guidelines:

- specify the version of `@riebel/tcomb-form-native-ts` you are using
- specify the version of `react` and `react-native` you are using
- specify the version of `@react-native-community/datetimepicker` (peer dep)
- specify your TypeScript version
- if the issue regards a bug, please provide a minimal failing example / test

## Pull Request Guidelines

Before you submit a pull request from your forked repo, check that it meets these guidelines:

1. If the pull request fixes a bug, it should include tests that fail without the changes, and pass
with them.
2. If the pull request adds functionality, the docs should be updated as part of the same PR.
3. Please rebase and resolve all conflicts before submitting.

## Setting up your environment

After forking `@riebel/tcomb-form-native-ts` to your own GitHub org, do the following steps to get started:

```sh
# clone your fork to your local machine
git clone https://github.com/riebel/tcomb-form-native-ts.git

# step into local repo
cd tcomb-form-native-ts

# install dependencies
npm install
```

### Running Tests

```sh
npm test
```

### Style & Linting

This codebase adheres to a custom style and is enforced using [ESLint](http://eslint.org/).

It is recommended that you install an eslint plugin for your editor of choice when working on this
codebase, however you can always check to see if the source code is compliant by running:

```sh
npm run lint
```

## Project metadata

- Repository: https://github.com/riebel/tcomb-form-native-ts
- Issues: https://github.com/riebel/tcomb-form-native-ts/issues
- Node: see `engines` in `package.json` (>= 22)
- Scripts: `build`, `test`, `lint`, see `package.json`

## Attribution

This project builds on the original work of Giulio Canti (`tcomb-form-native`). We aim to maintain
API compatibility while updating the internals and documentation for modern React Native and TypeScript.

