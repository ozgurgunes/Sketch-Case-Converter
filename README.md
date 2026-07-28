> [!WARNING]
> **Unmaintained Project:** This project is no longer actively maintained or supported. 
> All issues, pull requests, and feature requests will be ignored. 
> Feel free to fork the repository, but use it at your own risk.

# Case Converter  [![Download Latest][image]][link]

[image]: https://img.shields.io/github/release/ozgurgunes/Sketch-Case-Converter.svg?label=Download
[link]: https://github.com/ozgurgunes/Sketch-Case-Converter/releases/latest/download/case-converter.sketchplugin.zip

Case Converter plugin for Sketch, converts case of text in selected layers, symbol overrides or even all overrides of all instances of a symbol to `Sentence case`, `Title Case`, `UPPER CASE` or `lower case`.

## Installation

[Download][link] the latest release, unzip and double click on the .sketchplugin file.

#### Alternatively

Search for Case Converter in [Sketchrunner](http://sketchrunner.com/) or [Sketchpacks](https://sketchpacks.com/).

## Usage

All plugin commands have 4 scopes depending on your selection.

### Select Symbol Master

If you select a symbol master; first you will be asked to choose text overrides which which will be converted, then all chosen overrides of all instances of the symbol will be converted.

### Select Symbol Instances

If you select instances of same symbol; like symbol master, first you will be asked to choose text overrides which which will be converted, then all chosen overrides of selected symbols will be converted.

### Select Overrides

If you select overrides directly; all text overrides in your selection will be converted.

### Select Text Layers

If your selection has any text layers; command will be applied on all text layers in your selection.

## Settings

Plugin supports locale languages which mean you can convert `istanbul` to `İSTANBUL` if you choose "Turkish" in plugin settings.
