import sketch from 'sketch/dom'
import settings from 'sketch/settings'
import * as UI from './ui.js'
import {
  locale,
  languages,
  getSelected,
  getOptionList,
  analytics
} from './utils.js'

var doc = sketch.getSelectedDocument()
var selection = doc.selectedLayers

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

export const sentenceCase = context => {
  try {
    convertCommand(sentenceCaseFunction)
  } catch (e) {
    console.log(e)
    return e
  }
}

export const pluginSettings = context => {
  try {
    let buttons = ['Save', 'Cancel']
    let info = 'Please select a symbol state.'
    let accessory = UI.popUpButton(languages.map(lang => lang.name))
    accessory.selectItemAtIndex(languages.map(lang => lang.code).indexOf(locale))
    let response = UI.dialog(info, accessory, buttons)
    if (response === 1000) {
      let result = languages.map(lang => lang.code)[accessory.indexOfSelectedItem()]
      settings.setSettingForKey('locale', result)
      analytics(result, 1)
      return UI.message('Settings saved.', 'success')
    }
  } catch (e) {
    console.log(e)
    return e
  }
}

const convertCommand = commandFunction => {
  let selected = getSelected(selection)
  let result
  switch (selected.type) {
    case sketch.Types.Text:
      result = convertLayers(selected.layers, commandFunction)
      analytics('Text Layer', result)
      return UI.message(result + ' text layers converted.', 'success')
    case sketch.Types.SymbolMaster:
      result = convertSymbols(selected.layers[0].getAllInstances(), commandFunction)
      analytics('Symbol Master', result)
      return UI.message(result + ' overrides in ' +
        selected.length + ' symbols converted.', 'success')
    case sketch.Types.SymbolInstance:
      result = convertSymbols(selected.layers, commandFunction)
      analytics('Symbol Instance', result)
      return UI.message(result + ' overrides in ' +
        selected.layers.length + ' symbols converted.', 'success')
    case sketch.Types.Override:
      result = convertOverrides(selected.layers, commandFunction)
      analytics('Symbol Override', result)
      return UI.message(result + ' overrides in ' +
        selection.length + ' symbols converted.', 'success')
  }
}

const convertLayers = (layers, caseFunction) => {
  layers.map(layer => {
    layer.text = caseFunction(layer.text, locale)
  })
  return layers.length
}

const convertSymbols = (symbols, caseFunction) => {
  let buttons = ['Delete', 'Cancel', 'Convert All']
  let info = 'Please select overrides to be converted.'
  let overrides = symbols[0].overrides.filter(o => {
    return !o.isDefault && o.editable && o.property == 'stringValue'
  })
  if (overrides.length < 1) {
    analytics('No Overrides')
    throw UI.dialog('There are not any editable text overrides.')
  }
  let optionList = UI.optionList(getOptionList(symbols[0], overrides))
  let accessory = UI.scrollView(optionList.view)
  let response = UI.dialog(info, accessory, buttons)

  if (response === 1000 || response === 1002) {
    if (response === 1002) {
      optionList.options.map(option => option.setState(true))
    }
    if (optionList.getSelection().length == 0) {
      analytics('Convert None')
      return UI.message('Nothing converted.')
    }
    let c = 0
    symbols.map(symbol => {
      let symbolOverrides = symbol.overrides.filter(o => {
        return !o.isDefault && o.editable && o.property == 'stringValue'
      })
      optionList.getSelection().map(i => {
        symbol.setOverrideValue(overrides[i],
          caseFunction(symbolOverrides[i].value, locale))
        c++
      })
    })
    return c
  }
}

const convertOverrides = (overrides, caseFunction) => {
  let c = 0
  selection.layers.map(symbol => {
    for (let i = 0; i < overrides.length; i++) {
      let override = symbol.overrides
        .find(o => overrides[i] == symbol.id + '#' + o.id && o.property == 'stringValue')
      if (override) {
        symbol.setOverrideValue(override, caseFunction(override.value, locale))
        c++
      }
    }
  })
  return c
}

const sentenceCaseFunction = (text, locale) => {
  return text.toLocaleLowerCase(locale)
    .replace(/^\s*\w|[.?!…(...)]\s*./gu,
      s => s.toLocaleUpperCase(locale))
}

const titleCaseFunction = (text, locale) => {
  return text.replace(/([^\s:-])([^\s:-]*)/gu, ($0, $1, $2) => {
    return $1.toLocaleUpperCase(locale) + $2.toLocaleLowerCase(locale)
  })
}

const upperCaseFunction = (text, locale) => {
  return text.toLocaleUpperCase(locale)
}

const lowerCaseFunction = (text, locale) => {
  return text.toLocaleLowerCase(locale)
}
