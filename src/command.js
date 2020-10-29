import sketch from 'sketch/dom'
import settings from 'sketch/settings'
import {
  showMessage,
  successMessage,
  alert,
  popUpButton,
  scrollView,
  optionList,
} from '@ozgurgunes/sketch-plugin-ui'
import analytics from '@ozgurgunes/sketch-plugin-analytics'
import { languages, getSelection, getOptionList } from './utils'

const locale = settings.settingForKey('locale') || 'en-US'

export function upperCase() {
  convertCommand(upperCaseFunction)
}

export function lowerCase() {
  convertCommand(lowerCaseFunction)
}

export function titleCase() {
  convertCommand(titleCaseFunction)
}

export function sentenceCase() {
  convertCommand(sentenceCaseFunction)
}

export function pluginSettings() {
  let buttons = ['Save', 'Cancel']
  let info = 'Please select the language.'
  let accessory = popUpButton(languages.map(lang => lang.name))
  accessory.selectItemAtIndex(languages.map(lang => lang.code).indexOf(locale))
  let response = alert(info, buttons, accessory).runModal()
  if (response === 1000) {
    let result = languages.map(lang => lang.code)[
      accessory.indexOfSelectedItem()
    ]
    settings.setSettingForKey('locale', result)
    analytics(result, 1)
    return successMessage('Settings saved.')
  }
}

function convertCommand(commandFunction) {
  let selection = getSelection()
  if (!selection) return
  switch (selection.type) {
    case sketch.Types.Text:
      return convertLayers(selection.layers, commandFunction)
    case sketch.Types.SymbolMaster:
      return convertSymbols(
        selection.layers[0].getAllInstances(),
        commandFunction,
        true
      )
    case sketch.Types.SymbolInstance:
      return convertSymbols(selection.layers, commandFunction)
    case sketch.Types.Override:
      return convertOverrides(
        selection.layers,
        selection.overrides,
        commandFunction
      )
  }
}

function convertLayers(layers, caseFunction) {
  layers.map(layer => {
    layer.text = caseFunction(layer.text, locale)
  })
  analytics('Text Layer', layers.length)
  return successMessage(layers.length + ' text layers converted.')
}

function convertSymbols(symbols, caseFunction, masterSelected) {
  let buttons = ['Convert', 'Cancel', 'Convert All']
  let info = 'Please select overrides to be converted.'
  let overrides = symbols[0].overrides.filter(o => {
    return !o.isDefault && o.editable && o.property == 'stringValue'
  })
  if (overrides.length < 1) {
    analytics('No Overrides')
    return alert('There are not any editable text overrides.').runModal()
  }
  let overrideOptions = optionList(getOptionList(symbols[0], overrides))
  let accessory = scrollView(overrideOptions.view)
  let response = alert(info, buttons, accessory).runModal()
  if (!response || response === 1001) return
  if (response === 1002) {
    overrideOptions.options.map(option => option.setState(true))
  }
  if (overrideOptions.getSelection().length == 0) {
    analytics('Convert None')
    return showMessage('Nothing converted.')
  }
  let c = 0
  symbols.map(symbol => {
    let symbolOverrides = symbol.overrides.filter(o => {
      return !o.isDefault && o.editable && o.property == 'stringValue'
    })
    overrideOptions.getSelection().map(i => {
      symbol.setOverrideValue(
        overrides[i],
        caseFunction(symbolOverrides[i].value, locale)
      )
      c++
    })
  })
  if (masterSelected) {
    analytics('Symbol Master', c)
    return successMessage(
      c + ' overrides in ' + symbols.length + ' symbols converted.'
    )
  } else {
    analytics('Symbol Instance', c)
    return successMessage(
      c + ' overrides in ' + symbols.length + ' symbols converted.'
    )
  }
}

function convertOverrides(layers, overrides, caseFunction) {
  let c = 0
  layers.map(symbol => {
    for (let i = 0; i < overrides.length; i++) {
      let override = symbol.overrides.find(
        o =>
          overrides[i] == symbol.id + '#' + o.id && o.property == 'stringValue'
      )
      if (override) {
        symbol.setOverrideValue(override, caseFunction(override.value, locale))
        c++
      }
    }
  })
  analytics('Symbol Override', c)
  return successMessage(
    c + ' overrides in ' + layers.length + ' symbols converted.'
  )
}

function sentenceCaseFunction(text, locale) {
  return text
    .toLocaleLowerCase(locale)
    .replace(/^\s*\w|[.?!…(...)]\s*./gu, s => s.toLocaleUpperCase(locale))
}

function titleCaseFunction(text, locale) {
  return text.replace(/([^\s:-])([^\s:-]*)/gu, ($0, $1, $2) => {
    return $1.toLocaleUpperCase(locale) + $2.toLocaleLowerCase(locale)
  })
}

function upperCaseFunction(text, locale) {
  return text.toLocaleUpperCase(locale)
}

function lowerCaseFunction(text, locale) {
  return text.toLocaleLowerCase(locale)
}
