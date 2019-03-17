import sketch from "sketch/dom"
import settings from "sketch/settings"
import * as UI from "./ui.js"
import {
  locale,
  languages,
  getSelected,
  getOptionList,
  analytics
} from "./utils.js"

var doc = sketch.getSelectedDocument(),
  selection = doc.selectedLayers

export const upperCase = context => {
  try {
    convertCommand(upperCaseFunction)
  } catch (e) {
    console.log(e)
    return e
  }
}

export const lowerCase = context => {
  try {
    convertCommand(lowerCaseFunction)
  } catch (e) {
    console.log(e)
    return e
  }
}

export const titleCase = context => {
  try {
    convertCommand(titleCaseFunction)
  } catch (e) {
    console.log(e)
    return e
  }
}

export const properCase = context => {
  try {
    convertCommand(properCaseFunction)
  } catch (e) {
    console.log(e)
    return e
  }
}

export const pluginSettings = context => {
  try {
    let buttons = ['Save', 'Cancel'],
      info = "Please select a symbol state.",
      accessory = UI.popUpButton(languages.map(lang => lang.name))
    accessory.selectItemAtIndex(languages.map(lang => lang.code).indexOf(locale))
    let response = UI.dialog(info, accessory, buttons)
    if (response === 1000) {
      let result = languages.map(lang => lang.code)[accessory.indexOfSelectedItem()]
      settings.setSettingForKey("locale", result)
      analytics(result, 1)
      return UI.message("Settings saved.", "success")
    }
  } catch (e) {
    console.log(e)
    return e
  }
}

const convertCommand = commandFunction => {
  let selected = getSelected(selection),
    result
  switch (selected.type) {
    case sketch.Types.Text:
      result = convertLayers(selected.layers, commandFunction)
      analytics("Text Layer", result)
      return UI.message(result + " text layers converted.", "success")
    case sketch.Types.SymbolMaster:
      result = convertSymbols(selected.layers[0].getAllInstances(), commandFunction)
      analytics("Symbol Master", result)
      return UI.message(result + " overrides in " +
        selected.length + " symbols converted.", "success")
    case sketch.Types.SymbolInstance:
      result = convertSymbols(selected.layers, commandFunction)
      analytics("Symbol Instance", result)
      return UI.message(result + " overrides in " +
        selected.layers.length + " symbols converted.", "success")
    case sketch.Types.Override:  
      result = convertOverrides(selected.layers, commandFunction)
      analytics("Symbol Override", result)
      return UI.message(result + " overrides converted.", "success")
  }
}

const convertLayers = (layers, caseFunction) => {
  layers.map(layer => {
    layer.text = caseFunction(layer.text, locale)
  })
  return layers.length
}

const convertSymbols = (symbols, caseFunction) => {
  let buttons = ['Delete', 'Cancel', 'Convert All'],
    info = "Please select overrides to be converted.",
    overrides = symbols[0].overrides.filter(o => {
      return !o.isDefault && o.editable && o.property == "stringValue"
    })
    if (overrides.length < 1) {
    analytics("No Overrides")
    throw UI.dialog("There are not any editable text overrides.")
  }
  let list = UI.optionList(getOptionList(symbols[0], overrides)),
    accessory = UI.scrollView(list.view),
    response = UI.dialog(info, accessory, buttons)

  if (response === 1000 || response === 1002) {
    if (response === 1002) {
      list.options.map(option => option.setState(true))
    }
    if (list.selectedIndexes().length == 0) {
      analytics("Convert None")
      return UI.message("Nothing converted.")
    }
    let c = 0
    symbols.map(symbol => {
      let symbolOverrides = symbol.overrides.filter(o => {
        return !o.isDefault && o.editable && o.property == "stringValue"
      })
      list.selectedIndexes().map(i => {
        symbol.setOverrideValue(overrides[i],
          caseFunction(symbolOverrides[i].value, locale))
        c++
      })
    })
    return c
  }
}

const convertOverrides = (overrides, caseFunction) => {
  if (selection.layers.length > 1 || 
    selection.layers[0].type != sketch.Types.SymbolInstance) {
    analytics("Override Selection")
    throw UI.dialog("Only one symbol could be selected to convert overrides.")
  }
  let symbol = selection.layers[0], c=0
  for (let i = 0; i < overrides.length; i++) {
    let override = symbol.overrides
      .find(so => overrides[i].includes(so.id) && so.property == "stringValue")
    if (override) {
      symbol.setOverrideValue(override, caseFunction(override.value, locale))
      c++
    }
  }
  return c
}

const properCaseFunction = (text, locale) => {
  return text.toLocaleLowerCase(locale)
    .replace(/^\s*\w|[\.\?!…(...)]\s*\w/gu,
      s => s.toLocaleUpperCase(locale))
}

const titleCaseFunction = (text, locale) => {
    return text.replace(/([^\s:\-])([^\s:\-]*)/gu, ($0, $1, $2) => {
      return $1.toLocaleUpperCase(locale) + $2.toLocaleLowerCase(locale);
    });
  }

const upperCaseFunction = (text, locale) => {
  return text.toLocaleUpperCase(locale)
}

const lowerCaseFunction = (text, locale) => {
  return text.toLocaleLowerCase(locale)
}
