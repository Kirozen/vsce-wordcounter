import { Dictionary } from 'lodash';
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

class TextConfig {
  word: string = "word";
  words: string = "words";
  char: string = "char";
  chars: string = "chars";
  line: string = "line";
  lines: string = "lines";
  paragraph: string = "paragraph";
  paragraphs: string = "paragraphs";
  word_delimiter: string = "word_delimiter";
  delimiter: string = "delimiter";
  readingtime: string = "readingtime";
}

export class WordCounter {
  // wordRegEx: RegExp = /[\S]+/g;
  // wordRegEx: RegExp = /[\s]+/g;
  statusBarItem: StatusBarItem;
  count_words: boolean = false;
  count_chars: boolean = false;
  count_lines: boolean = false;
  count_paragraphs: boolean = false;
  readtime: boolean = false;
  text: TextConfig = new TextConfig();
  wpm: number = 200;

  constructor() {
    this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
  }

  updateConfiguration(
    count_words: boolean,
    count_chars: boolean,
    count_lines: boolean,
    count_paragraphs: boolean,
    readtime: boolean,
    text: TextConfig,
    wpm: number
  ) {
    this.count_words = count_words;
    this.count_chars = count_chars;
    this.count_lines = count_lines;
    this.count_paragraphs = count_paragraphs;
    this.readtime = readtime;
    this.text = text;
    this.wpm = wpm;
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

  toDisplay(oIn: Dictionary<number>) {
    const out = [];
    if (this.count_words) {
      const val = oIn['words'];
      const text = val === 1 ? this.text.word : this.text.words;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }
    if (this.count_chars) {
      const val = oIn['chars'];
      const text = val === 1 ? this.text.char : this.text.chars;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }
    if (this.count_lines) {
      const val = oIn['lines'];
      const text = val === 1 ? this.text.line : this.text.lines;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }
    if (this.count_paragraphs) {
      const val = oIn['paragraphs'];
      const text = val === 1 ? this.text.paragraph : this.text.paragraphs;
      out.push(`${val}${this.text.word_delimiter}${text}`);
    }

    if (this.readtime) {
      const div = oIn.words / this.wpm;
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
    });

    return aDisplay.join(this.text.delimiter);
  }

  countSelectedSimple(doc: TextDocument, selection: Selection) {
    var content = doc.getText(selection.with());
    return this.computeResult(doc, content, true);
  }

  lineCount(content: string, hasSelectedText: boolean, doc: TextDocument) {
    let lines = 1;

    if (this.count_lines) {
      if (hasSelectedText) {
        lines = content.split('\n').length;
      } else {
        lines = doc.lineCount;
      }
    }

    return lines;
  }

  wordCount(content: string) {
    if (content && (this.count_words || this.readtime)) {
      // const matches = content.match(this.wordRegEx);
      let words = content.replace(/[0-9]/g, '');
      words = words.replace(/'|-/g, '');
      words = words.toLowerCase();
      const wordList = words.split(/[\s\W]+/);
      return wordList.filter(s => s.length > 0).length;
      // words = matches ? matches.length : 0;
    } else {
      return 0;
    }
  }

  paragraphCount(content: string, linefeed: EndOfLine) {
    let paragraphs = 0;

    if (content && this.count_paragraphs) {
      if (linefeed === EndOfLine.CRLF) {
        paragraphs = content.split(/\r\n[\r\n]+/).filter(p => p.length > 0).length;
      } else {
        paragraphs = content.split(/\n\n+/).filter(p => p.length > 0).length;
      }
    }

    return paragraphs;
  }

  countSelectedMultiple(doc: TextDocument, selections: Selection[]) {
    let words = 0;
    let chars = 0;
    let paragraphs = 0;
    let lines = 0;

    selections.forEach(selection => {
      const content = doc.getText(selection.with());

      if (this.count_words) {
        words += this.wordCount(content);
      }

      if (this.count_paragraphs) {
        paragraphs += this.paragraphCount(content, doc.eol);
      }

      if (this.count_chars) {
        chars += content.length;
      }

      if (this.count_lines) {
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
    });

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
      this.wordCounter.update(true);
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
    const count_words: boolean = configuration.get('count_words', false);
    const count_chars: boolean = configuration.get('count_chars', false);
    const count_lines: boolean = configuration.get('count_lines', false);
    const count_paragraphs: boolean = configuration.get('count_paragraphs', false);
    const readtime: boolean = configuration.get('readtime', false);
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

    let wpm: number = configuration.get('wpm', 200);
    if (wpm < 1) {
      wpm = 200;
    }

    this.enabled = configuration.get('enabled', false) && (count_chars || count_lines || count_paragraphs || count_words);

    this.wordCounter.updateConfiguration(
      count_words,
      count_chars,
      count_lines,
      count_paragraphs,
      readtime,
      text,
      wpm
    );
  }
}

// const _WordCounter = WordCounter;
// export {
//   _WordCounter as WordCounter
// };
// const _WordCounterController = WordCounterController;
// export {
//   _WordCounterController as WordCounterController
// };
