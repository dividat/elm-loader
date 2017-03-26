# elm-loader

A simple webpack loader for [Elm](https://elm-lang.org).


## Differences to other Elm webpack loaders

[elm-webpack-loader](https://github.com/elm-community/elm-webpack-loader):
  - Add all `*.elm` files contained in the directories listed in the `source-directories` field of `elm-package.json` as dependencies. This simplifies dependency finding but may include some false positives (files that are considered to be dependencies but are really not).
  - Don't use `elm-node-compiler`.


[elm-simple-loader](https://github.com/justinwoo/elm-simple-loader):
  - Support multiple targets (with temp files instead of always writing to `elm.js`)


[elm-project-loader](https://www.npmjs.com/package/elm-project-loader):
  - Don't require a `.elmproj` file, just use `elm-package.json`
