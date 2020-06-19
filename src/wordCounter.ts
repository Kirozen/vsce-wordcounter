import {
  ConfigurationChangeEvent,
  Disposable,
  EndOfLine,
  Selection,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
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
  include_eol_chars: boolean;
  wpm: number;
  side_left: Counter[];
  side_right: Counter[];
}

interface DisplayData {
  words: number;
  chars: number;
  lines: number;
  paragraphs: number;
}

type Counter = "word" | "char" | "line" | "paragraph" | "readingtime"

export class WordCounter {
  wordRegEx: RegExp = /[\S]+/g;
  wordRegExSub: RegExp = /[\w\u0370-\uffef]+/;
  crlfRE = {
    split: /\r\n[\r\n]+/,
    replace: /\r\n/g
  };
  lfRE = {
    split: /\n\n+/,
    replace: /\n/g
  };
  statusBarItemLeft: StatusBarItem;
  statusBarItemRight: StatusBarItem;

  text: TextConfig = {} as TextConfig;
  config: WordCounterConfiguration = {} as WordCounterConfiguration;

  constructor() {
    this.statusBarItemLeft = window.createStatusBarItem(StatusBarAlignment.Left);
    this.statusBarItemRight = window.createStatusBarItem(StatusBarAlignment.Right);
  }

  updateConfiguration(configuration: WordCounterConfiguration, text: TextConfig) {
    this.config = configuration;
    this.text = text;
  }

  update(fromSelection: boolean = true) {
    if (!this.statusBarItemLeft) {
      this.statusBarItemLeft = window.createStatusBarItem(StatusBarAlignment.Left);
    }
    if (!this.statusBarItemRight) {
      this.statusBarItemRight = window.createStatusBarItem(StatusBarAlignment.Right);
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      this.statusBarItemLeft.hide();
      this.statusBarItemRight.hide();
      return;
    }

    const bSelectionSimple = fromSelection && editor.selections.length === 1 && !editor.selection.isEmpty;
    const bSelectionMultiple = fromSelection && editor.selections.length > 1;

    if (bSelectionSimple) {
      this.statusBarItemLeft.text = this.countSelectedSimple(editor.document, editor.selection, StatusBarAlignment.Left);
      this.statusBarItemRight.text = this.countSelectedSimple(editor.document, editor.selection, StatusBarAlignment.Right);
    } else if (bSelectionMultiple) {
      this.statusBarItemLeft.text = this.countSelectedMultiple(editor.document, editor.selections, StatusBarAlignment.Left);
      this.statusBarItemRight.text = this.countSelectedMultiple(editor.document, editor.selections, StatusBarAlignment.Right);
    } else {
      this.statusBarItemLeft.text = this.countAll(editor.document, StatusBarAlignment.Left);
      this.statusBarItemRight.text = this.countAll(editor.document, StatusBarAlignment.Right);
    }
    this.statusBarItemLeft.show();
    this.statusBarItemRight.show();
  }

  hide() {
    this.statusBarItemLeft.hide();
    this.statusBarItemRight.hide();
  }

  dispose() {
    this.statusBarItemLeft.dispose();
    this.statusBarItemRight.dispose();
  }

  toDisplay(oIn: DisplayData, alignment: StatusBarAlignment) {
    const order = alignment === StatusBarAlignment.Left ? this.config.side_left : this.config.side_right;
    const map = {} as Record<Counter, string>

    if (this.config.count_words && order.includes("word")) {
      const val = oIn.words;
      const text = val === 1 ? this.text.word : this.text.words;
      map["word"] = `${val}${this.text.word_delimiter}${text}`;
    }
    if (this.config.count_chars && order.includes("char")) {
      const val = oIn.chars;
      const text = val === 1 ? this.text.char : this.text.chars;
      map["char"] = `${val}${this.text.word_delimiter}${text}`;
    }
    if (this.config.count_lines && order.includes("line")) {
      const val = oIn.lines;
      const text = val === 1 ? this.text.line : this.text.lines;
      map["line"] = `${val}${this.text.word_delimiter}${text}`;
    }
    if (this.config.count_paragraphs && order.includes("paragraph")) {
      const val = oIn.paragraphs;
      const text = val === 1 ? this.text.paragraph : this.text.paragraphs;
      map["paragraph"] = `${val}${this.text.word_delimiter}${text}`;
    }
    if (this.config.readtime && order.includes("readingtime")) {
      const div = oIn.words / this.config.wpm;
      const m = Math.floor(div);
      const s = Math.round(60 * (div - m));
      map["readingtime"] = `~${m}m${s}s ${this.text.readingtime}`;
    }

    return order.map(key => map[key]);
  }

  computeResult(doc: TextDocument, content: string, hasSelectedText: boolean, alignment: StatusBarAlignment) {
    const aDisplay = this.toDisplay({
      words: this.wordCount(content),
      chars: this.charCount(content, doc.eol),
      lines: this.lineCount(content, hasSelectedText, doc),
      paragraphs: this.paragraphCount(content, doc.eol)
    } as DisplayData, alignment);

    return aDisplay.join(this.text.delimiter);
  }

  countSelectedSimple(doc: TextDocument, selection: Selection, alignment: StatusBarAlignment) {
    var content = doc.getText(selection.with());
    return this.computeResult(doc, content, true, alignment);
  }

  charCount(content: string, linefeed: EndOfLine) {
    if (this.config.include_eol_chars) {
      return content.length;
    }
    const re = linefeed === EndOfLine.CRLF ? this.crlfRE.replace : this.lfRE.replace;
    return content.replace(re, '').length;
  }

  lineCount(content: string, hasSelectedText: boolean, doc: TextDocument) {
    if (this.config.count_lines) {
      if (hasSelectedText) {
        return content.split('\n').length;
      }
      return doc.lineCount;
    }
    return 1;
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

  countSelectedMultiple(doc: TextDocument, selections: Selection[], alignment: StatusBarAlignment) {
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
    } as DisplayData, alignment);

    return aDisplay.join(this.text.delimiter);
  }

  countAll(doc: TextDocument, alignment: StatusBarAlignment) {
    return this.computeResult(doc, doc.getText(), false, alignment);
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
      } else {
        this.wordCounter.update(false);
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

    const side_left = configuration.get('side.left', ["word", "char", "line", "paragraph", "readingtime"]) as Counter[]
    const side_right = configuration.get('side.right', []) as Counter[]
    const enabling = new Set<Counter>(Array.from(side_left).concat(side_right))

    let config: WordCounterConfiguration = {
      count_words: enabling.has("word"),
      count_chars: enabling.has("char"),
      count_lines: enabling.has("line"),
      count_paragraphs: enabling.has("paragraph"),
      readtime: enabling.has("readingtime"),
      simple_wordcount: configuration.get('simple_wordcount', true),
      include_eol_chars: configuration.get('include_eol_chars', true),
      wpm: configuration.get('wpm', 200),
      side_left,
      side_right,
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
