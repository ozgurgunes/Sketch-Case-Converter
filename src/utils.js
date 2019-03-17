import sketch from 'sketch/dom'
import settings from 'sketch/settings'
import send from 'sketch-module-google-analytics'
import langmap from "langmap"
import * as UI from './ui.js'

const getLocale = () => {
  return settings.settingForKey("locale") || "en-US"
}

export const locale = getLocale()

const getLanguages = () => {
  let languages = []
  for (let lang in langmap) {
    if (lang.length == 5) {
      languages.push({
        code: lang,
        name: langmap[lang]["nativeName"]
      })
    }
  }
 return languages.sort((a, b) => a.name > b.name)
}

export const languages = getLanguages()

export const getSelected = selection => {
  let overrides = getSelectedOverrides()
  switch (true) {
    case (!selection.layers[0] && !overrides.length):
      analytics("No Selection")
      throw UI.message("Please select a symbol master, symbols or text layers.", "error")
    case (overrides.length > 0):
      return {
        type: sketch.Types.Override,
        layers: overrides
      }
    case (isSymbolMaster(selection)):
      return {
        type: sketch.Types.SymbolMaster,
        layers: selection.layers
      }
    case (isAllSameSymbol(selection)):
      return {
        type: sketch.Types.SymbolInstance,
        layers: selection.layers
      }
    case (!hasTextLayer(selection)):
      if (isAllSymbol(selection)) {
        analytics("Not Same Symbol")
        throw UI.dialog("Selected symbols master must be same.")
      }
      analytics("No Text Layers")
      throw UI.message("Please select a symbol master, symbols or text layers.", "error")
    default:
      return {
        type: sketch.Types.Text,
        layers: selection.layers.filter(layer => layer.type == sketch.Types.Text)
      }
  }
}

const getSelectedOverrides = () => {
  return context.document.documentData().selectedOverrides()
}

const hasTextLayer = selection => {
  return selection.layers.some(layer => layer.type == sketch.Types.Text)
}

const isSymbolMaster = selection => {
  return selection.length == 1 &&
    selection.layers[0].type == sketch.Types.SymbolMaster
}

const isAllSymbol = selection => {
  return selection.layers.every(item => item.type == sketch.Types.SymbolInstance)
}

const isAllSameSymbol = selection => {
  return selection.layers[0].type == sketch.Types.SymbolInstance &&
    selection.layers.every(item => item.master.id == selection.layers[0].master.id)
}

export const getOptionList = (symbol, overrides) => {
  return overrides.map(override => {
    let layers = override.path.split("/"),
      list = []
    layers.map((layer, i) => {
      list.push(symbol.overrides.find(symbolOverride => {
        return symbolOverride.path == layers.slice(0, i + 1).join("/")
      }).affectedLayer.name)
    })
    let path = list.join(" > ")
    if (path.length > 40) {
      path = path.slice(0,18) + " ... " + path.slice(-18)
    }
    return path
  })
}

export const analytics = (label, value) => {
  const ID = "UA-5738625-2"
  const payload = {}
  payload.ec = context.plugin.name()
  payload.ea = context.command.name()
  if (label) {
    payload.el = label
  }
  if (value) {
    payload.ev = value
  }
  return send(context, ID, 'event', payload)
}
