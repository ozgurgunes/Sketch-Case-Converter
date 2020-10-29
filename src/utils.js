import sketch from 'sketch/dom'
import langmap from 'langmap'
import { errorMessage, alert } from '@ozgurgunes/sketch-plugin-ui'
import analytics from '@ozgurgunes/sketch-plugin-analytics'

function getLanguages() {
  let languages = []
  for (let lang in langmap) {
    if (lang.length == 5) {
      languages.push({
        code: lang,
        name: langmap[lang]['nativeName'],
      })
    }
  }
  return languages.sort((a, b) => a.name > b.name)
}

export const languages = getLanguages()

export function getSelection() {
  let selected = sketch.getSelectedDocument().selectedLayers
  let overrides = getSelectedOverrides()
  switch (true) {
    case !selected.layers[0] && !overrides.length:
      analytics('No Selection')
      return errorMessage(
        'Please select a symbol master, symbols or text layers.'
      )
    case overrides.length > 0:
      return {
        type: sketch.Types.Override,
        layers: selected.layers,
        overrides: overrides,
      }
    case isSymbolMaster(selected):
      return {
        type: sketch.Types.SymbolMaster,
        layers: selected.layers,
      }
    case isAllSameSymbol(selected):
      return {
        type: sketch.Types.SymbolInstance,
        layers: selected.layers,
      }
    case !hasTextLayer(selected):
      if (isAllSymbol(selected)) {
        analytics('Not Same Symbol')
        return alert('Selected symbols master must be same.').runModal()
      }
      analytics('No Text Layers')
      return errorMessage(
        'Please select a symbol master, symbols or text layers.'
      )
    default:
      return {
        type: sketch.Types.Text,
        layers: selected.layers.filter(
          layer => layer.type == sketch.Types.Text
        ),
      }
  }
}

function getSelectedOverrides() {
  return sketch
    .getSelectedDocument()
    .sketchObject.documentData()
    .selectedOverrides()
}

function hasTextLayer(selected) {
  return selected.layers.some(layer => layer.type == sketch.Types.Text)
}

function isSymbolMaster(selected) {
  return (
    selected.length == 1 && selected.layers[0].type == sketch.Types.SymbolMaster
  )
}

function isAllSymbol(selected) {
  return selected.layers.every(item => item.type == sketch.Types.SymbolInstance)
}

function isAllSameSymbol(selected) {
  return selected.layers.every(
    item =>
      item.type == sketch.Types.SymbolInstance &&
      item.master.id == selected.layers[0].master.id
  )
}

export function getOptionList(symbol, overrides) {
  return overrides.map(override => {
    let layers = override.path.split('/')
    let list = []
    layers.map((layer, i) => {
      list.push(
        symbol.overrides.find(symbolOverride => {
          return symbolOverride.path == layers.slice(0, i + 1).join('/')
        }).affectedLayer.name
      )
    })
    let path = list.join(' > ')
    if (path.length > 40) {
      path = path.slice(0, 18) + ' … ' + path.slice(-18)
    }
    return path
  })
}
