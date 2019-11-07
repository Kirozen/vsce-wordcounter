import {
  ConfigurationChangeEvent,
  Disposable,
  EndOfLine,
  Selection,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditorSelectionChangeEvent,
  window,
  workspace,
} from 'vscode';

interface TextConfig {
  word: string;
  words: string;
  char: string;
  chars: string;
  line: string;
  lines: string;
  paragraph: string;
  paragraphs: string;
  word_delimiter: string;
  delimiter: string;
  readingtime: string;
}

interface WordCounterConfiguration {
  count_words: boolean;
  count_chars: boolean;
  count_lines: boolean;
  count_paragraphs: boolean;
  readtime: boolean;
  simple_wordcount: boolean;
  wpm: number;
}

interface DisplayData {
  words: number;
  chars: number;
  lines: number;
  paragraphs: number;
}

export class WordCounter {
  wordRegEx: RegExp = /[\S]+/g;
  wordRegExSub: RegExp = /[\w\u0370-\uffef]+/;
  crlfRE = {
    split: /\r\n[\r\n]+/,
    replace: /\r\n/
  };
  lfRE = {
    split: /\n\n+/,
    replace: /\n/
  };
  statusBarItem: StatusBarItem;
  text: TextConfig = {} as TextConfig;
  config: WordCounterConfiguration = {} as WordCounterConfiguration;

  constructor() {
    this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
  }

  updateConfiguration(configuration: WordCounterConfiguration, text: TextConfig) {
    this.config = configuration;
    this.text = text;
  }

  update(fromSelection: boolean = true) {
    if (!this.statusBarItem) {
      this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      this.statusBarItem.hide();
      return;
    }

    const bSelectionSimple = fromSelection && editor.selections.length === 1 && !editor.selection.isEmpty;
    const bSelectionMultiple = fromSelection && editor.selections.length > 1;

    if (bSelectionSimple) {
      this.statusBarItem.text = this.countSelectedSimple(editor.document, editor.selection);
    } else if (bSelectionMultiple) {
      this.statusBarItem.text = this.countSelectedMultiple(editor.document, editor.selections);
    } else {
      this.statusBarItem.text = this.countAll(editor.document);
    }
    this.statusBarItem.show();
  }

  hide() {
    this.statusBarItem.hide();
  }

  dispose() {
    this.statusBarItem.dispose();
  }

  toDisplay(oIn: DisplayData) {
    const out = [];
    if (this.config.count_words) {
      const val = oIn.words;
      const text = val === 1 ? this.text.word : this.text.words;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }
    if (this.config.count_chars) {
      const val = oIn.chars;
      const text = val === 1 ? this.text.char : this.text.chars;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }
    if (this.config.count_lines) {
      const val = oIn.lines;
      const text = val === 1 ? this.text.line : this.text.lines;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }
    if (this.config.count_paragraphs) {
      const val = oIn.paragraphs;
      const text = val === 1 ? this.text.paragraph : this.text.paragraphs;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }

    if (this.config.readtime) {
      const div = oIn.words / this.config.wpm;
      const m = Math.floor(div);
      const s = Math.round(60 * (div - m));
      out.push(`~${m}m${s}s ${this.text.readingtime}`);
    }

    return out;
  }

  computeResult(doc: TextDocument, content: string, hasSelectedText: boolean) {
    const aDisplay = this.toDisplay({
      words: this.wordCount(content),
      chars: content.length,
      lines: this.lineCount(content, hasSelectedText, doc),
      paragraphs: this.paragraphCount(content, doc.eol)
    } as DisplayData);

    return aDisplay.join(this.text.delimiter);
  }

  countSelectedSimple(doc: TextDocument, selection: Selection) {
    var content = doc.getText(selection.with());
    return this.computeResult(doc, content, true);
  }

  lineCount(content: string, hasSelectedText: boolean, doc: TextDocument) {
    let lines = 1;

    if (this.config.count_lines) {
      if (hasSelectedText) {
        lines = content.split('\n').length;
      } else {
        lines = doc.lineCount;
      }
    }

    return lines;
  }

  wordCount(content: string) {
    if (content && (this.config.count_words || this.config.readtime)) {
      const matches = content.match(this.wordRegEx);
      if (matches) {
        if (!this.config.simple_wordcount) {
          return matches.filter(s => {
            const submatches = s.match(this.wordRegExSub);
            return submatches ? submatches.length > 0 : false;
          }).length;
        }
        return matches.length;
      }
    }
    return 0;
  }

  paragraphCount(content: string, linefeed: EndOfLine) {
    if (content && this.config.count_paragraphs) {
      const re = linefeed === EndOfLine.CRLF ? this.crlfRE : this.lfRE;
      return content
        .split(re.split)
        .map(p => p.replace(re.replace, ''))
        .filter(p => p.length > 0)
        .length;
    }
    return 0;
  }

  countSelectedMultiple(doc: TextDocument, selections: Selection[]) {
    let words = 0;
    let chars = 0;
    let paragraphs = 0;
    let lines = 0;

    selections.forEach(selection => {
      const content = doc.getText(selection.with());

      if (this.config.count_words) {
        words += this.wordCount(content);
      }

      if (this.config.count_paragraphs) {
        paragraphs += this.paragraphCount(content, doc.eol);
      }

      if (this.config.count_chars) {
        chars += content.length;
      }

      if (this.config.count_lines) {
        if (selection.isSingleLine) {
          lines++;
        } else {
          lines += selection.end.line - selection.start.line + 1;
        }
      }
    });

    const aDisplay = this.toDisplay({
      words: words,
      chars: chars,
      lines: lines,
      paragraphs: paragraphs
    } as DisplayData);

    return aDisplay.join(this.text.delimiter);
  }

  countAll(doc: TextDocument) {
    return this.computeResult(doc, doc.getText(), false);
  }
}

export class WordCounterController {
  wordCounter: WordCounter;
  disposable: Disposable;
  enabled: boolean = false;
  languages: string[] = [];

  constructor(wordCounter: WordCounter) {
    this.wordCounter = wordCounter;
    this.reloadConfig();

    const subscriptions: Disposable[] = [];
    window.onDidChangeTextEditorSelection(this._onEventTextEditorSelection, this, subscriptions);
    window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, subscriptions);
    workspace.onDidChangeConfiguration(this._onEventWhenConfChanged, this, subscriptions);
    workspace.onDidChangeTextDocument(this._onEventChangeTextDocument, this, subscriptions);

    if (window.activeTextEditor && this._couldUpdate()) {
      this.wordCounter.update();
    }
    this.disposable = Disposable.from.apply(Disposable, subscriptions);
  }

  dispose() {
    this.disposable.dispose();
  }


  _couldUpdate() {
    return this.enabled && window && window.activeTextEditor && (this.languages === null || this.languages.includes(window.activeTextEditor.document.languageId));
  }

  _onEventChangeTextDocument(event: TextDocumentChangeEvent) {
    if (this._couldUpdate()) {
      this.wordCounter.update(false);
    } else {
      this.wordCounter.hide();
    }
  }

  _onDidChangeActiveTextEditor(event: any) {
    if (this._couldUpdate()) {
      this.wordCounter.update(false);
    } else {
      this.wordCounter.hide();
    }
  }

  _onEventTextEditorSelection(event: TextEditorSelectionChangeEvent) {
    if (this._couldUpdate()) {
      if (event.selections.filter(s => !s.isEmpty).length > 0) {
        this.wordCounter.update(true);
      }
    } else {
      this.wordCounter.hide();
    }
  }

  _onEventWhenConfChanged(event: ConfigurationChangeEvent) {
    this.reloadConfig();
    if (this._couldUpdate()) {
      this.wordCounter.update(false);
    } else {
      this.wordCounter.hide();
    }
  }

  reloadConfig() {
    const configuration = workspace.getConfiguration('wordcounter');
    this.languages = configuration.get('languages', []);
    let config: WordCounterConfiguration = {
      count_words: configuration.get('count_words', false),
      count_chars: configuration.get('count_chars', false),
      count_lines: configuration.get('count_lines', false),
      count_paragraphs: configuration.get('count_paragraphs', false),
      simple_wordcount: configuration.get('simple_wordcount', true),
      readtime: configuration.get('readtime', false),
      wpm: configuration.get('wpm', 200)
    } as WordCounterConfiguration;
    const text: TextConfig = {
      word: configuration.get('text.word'),
      words: configuration.get('text.words'),
      char: configuration.get('text.char'),
      chars: configuration.get('text.chars'),
      line: configuration.get('text.line'),
      lines: configuration.get('text.lines'),
      paragraph: configuration.get('text.paragraph'),
      paragraphs: configuration.get('text.paragraphs'),
      word_delimiter: configuration.get('text.word_delimiter'),
      delimiter: configuration.get('text.delimiter'),
      readingtime: configuration.get('text.readingtime')
    } as TextConfig;

    if (config.wpm < 1) {
      config.wpm = 200;
    }

    this.enabled = configuration.get('enabled', false) && (config.count_chars || config.count_lines || config.count_paragraphs || config.count_words);

    this.wordCounter.updateConfiguration(config, text);
  }
}
