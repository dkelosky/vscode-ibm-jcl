[![downloads](https://img.shields.io/visual-studio-marketplace/d/kelosky.ibm-jcl)](https://marketplace.visualstudio.com/items?itemName=kelosky.ibm-jcl)
[![license](https://img.shields.io/github/license/dkelosky/vscode-ibm-jcl)](https://github.com/dkelosky/vscode-ibm-jcl)

# JCL Highlighting Extension for VS Code

Minimum featured JCL highlighter and LSP extension for VS Code.

> Tip: Add editor configuration in `user.settings` to highlight continuation column, e.g. `"[jcl]" : { "editor.rulers" : [71, 72, 80]},`

## Features

Basic highlighting and symbol resolution `Ctrl + Shift + O`:

![Highlighting](./docs/images/example.png)

## Contributing

`npm run build:syntax` to convert `.yaml` to required `.json`.
