const vscode = require('vscode')
const _set = require('lodash/set.js')
const _assign = require('lodash/assign.js')

class WordCounter {
  update (fromSelection) {
    if (!this.statusBarItem) {
      this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    }

    const editor = vscode.window.activeTextEditor
    if (!editor) {
      this.statusBarItem.hide()
      return
    }

    const bSelectionSimple = fromSelection && editor.selections.length === 1 && !editor.selection.isEmpty
    const bSelectionMultiple = fromSelection && editor.selections.length > 1

    if (bSelectionSimple) {
      this.statusBarItem.text = this.countSelectedSimple(editor.document, editor.selection)
    } else if (bSelectionMultiple) {
      this.statusBarItem.text = this.countSelectedMultiple(editor.document, editor.selections)
    } else {
      this.statusBarItem.text = this.countAll(editor.document)
    }
    this.statusBarItem.show()
  }

  hide () {
    this.statusBarItem.hide()
  }

  dispose () {
    this.statusBarItem.dispose()
  }

  toDisplay (oIn) {
    const things = ['word', 'char', 'line']
    const out = []
    things.forEach(sKey => {
      if (this[`count_${sKey}s`]) {
        const val = oIn[sKey + 's']
        const textKey = sKey + (val === 1 ? '' : 's')
        out.push(`${val}${this.text.word_delimiter}${this.text[textKey]}`)
      }
    })
    if (this.readtime) {
      const div = oIn.words / this.wpm
      const m = Math.floor(div)
      const s = Math.round(60 * (div - m))
      out.push(`~${m}m${s}s ${this.text.readingtime}`)
    }
    return out
  }

  computeResult (doc, content, hasSelectedText) {
    const aDisplay = this.toDisplay({
      words: this.wordCount(content),
      chars: content.length,
      lines: hasSelectedText
        ? content.split('\n').length
        : doc.lineCount
    })
    return aDisplay.join(this.text.delimiter)
  }

  countSelectedSimple (doc, selection) {
    var content = doc.getText(selection.with())
    return this.computeResult(doc, content, true)
  }

  wordCount (content) {
    let words = 0
    if (content && (this.count_words || this.readtime)) {
      words = content.match(/\w+([-']?\w+)*/g).length
    }
    return words
  }

  countSelectedMultiple (doc, selections) {
    let words = 0
    let chars = 0
    const setLines = new Set()
    selections.forEach(selection => {
      const content = doc.getText(selection.with())
      words += this.wordCount(content)
      chars += content.length

      const iStart = selection.start.line
      const iEnd = selection.isSingleLine ? iStart + 1 : selection.end.line
      for (let i = iStart; i <= iEnd; i++) {
        setLines.add(i)
      }
    })

    const aDisplay = this.toDisplay({
      words,
      chars,
      lines: setLines.size
    })
    return aDisplay.join(this.text.delimiter)
  }

  countAll (doc) {
    return this.computeResult(doc, doc.getText(), false)
  }
}

class WordCounterController {
  constructor (wordCounter) {
    this.wordCounter = wordCounter
    this.reloadConfig()

    const subscriptions = []
    vscode.window.onDidChangeTextEditorSelection(this._onEventTextEditorSelection, this, subscriptions)
    vscode.window.onDidChangeActiveTextEditor(this._onEventWhenChanged, this, subscriptions)
    vscode.workspace.onDidChangeConfiguration(this._onEventWhenConfChanged, this, subscriptions)
    vscode.workspace.onDidChangeTextDocument(this._onEventWhenChanged, this, subscriptions)

    if (this.enabled && vscode.window.activeTextEditor) {
      this.wordCounter.update()
    }
    this.disposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions)

    this.dispose = function () {
      this.disposable.dispose()
    }
  }

  _onEventWhenChanged (event) {
    if (this.enabled) {
      this.wordCounter.update(false)
      return
    }
    this.wordCounter.hide()
  }

  _onEventTextEditorSelection (event) {
    if (this.enabled) {
      this.wordCounter.update(true)
      return
    }
    this.wordCounter.hide()
  }

  _onEventWhenConfChanged (event) {
    this.reloadConfig()
    this._onEventWhenChanged()
  }

  reloadConfig () {
    const configuration = vscode.workspace.getConfiguration('wordcounter')
    const outConfig = {}
    const aConfig = [
      'enabled',
      'count_words',
      'count_chars',
      'count_lines',
      'readtime',
      'wpm',
      'text.word',
      'text.words',
      'text.char',
      'text.chars',
      'text.line',
      'text.lines',
      'text.word_delimiter',
      'text.delimiter',
      'text.readingtime'
    ]
    aConfig.forEach((sKey) => {
      _set(outConfig, sKey, configuration.get(sKey))
    })
    if (outConfig.wpm < 1) {
      outConfig.wpm = 200
    }
    if (!outConfig.count_words && !outConfig.count_chars && !outConfig.count_lines && !outConfig.readtime) {
      outConfig.enabled = false
    }

    _assign(this, outConfig)
    _assign(this.wordCounter, outConfig)
  }
}

exports.WordCounter = WordCounter
exports.WordCounterController = WordCounterController
