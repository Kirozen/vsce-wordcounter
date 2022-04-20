import {
  ConfigurationChangeEvent,
  Disposable,
  EndOfLine,
  TextEditorSelectionChangeEvent,
  window,
  workspace,
} from "vscode";
import {
  Counter,
  TextConfig,
  WordCounter,
  WordCounterConfiguration,
} from "./wordCounter";

export class WordCounterController {
  wordCounter: WordCounter;
  disposable: Disposable;
  currentEol?: EndOfLine = EndOfLine.LF;
  enabled: boolean = false;
  languages: string[] = [];

  constructor(wordCounter: WordCounter) {
    this.wordCounter = wordCounter;
    this.reloadConfig();

    const subscriptions: Disposable[] = [];
    window.onDidChangeTextEditorSelection(
      this._onEventTextEditorSelection,
      this,
      subscriptions
    );
    window.onDidChangeActiveTextEditor(
      this._onDidChangeActiveTextEditor,
      this,
      subscriptions
    );
    workspace.onDidChangeConfiguration(
      this._onEventWhenConfChanged,
      this,
      subscriptions
    );

    if (window.activeTextEditor && this._couldUpdate()) {
      this._doUpdateComplete();
    }
    this.disposable = Disposable.from.apply(Disposable, subscriptions);
  }

  dispose() {
    this.disposable.dispose();
  }

  _couldUpdate() {
    return (
      this.enabled &&
      window &&
      window.activeTextEditor &&
      (this.languages === null ||
        this.languages.includes(window.activeTextEditor.document.languageId))
    );
  }

  _doUpdateComplete() {
    this._storeCurrentEOL();
    this.wordCounter.update(false);
  }

  _doUpdatePartial() {
    this._storeCurrentEOL();
    this.wordCounter.update(true);
  }

  _storeCurrentEOL() {
    this.currentEol = window.activeTextEditor?.document.eol;
  }

  // eslint-disable-next-line no-unused-vars
  _onDidChangeActiveTextEditor(_event: any) {
    if (this._couldUpdate()) {
      this._doUpdateComplete();
    } else {
      this.wordCounter.hide();
    }
  }

  _onEventTextEditorSelection(event: TextEditorSelectionChangeEvent) {
    if (this._couldUpdate()) {
      if (event.selections.filter((s) => !s.isEmpty).length > 0) {
        this._doUpdatePartial();
      } else {
        this._doUpdateComplete();
      }
    } else {
      this.wordCounter.hide();
    }
  }

  // eslint-disable-next-line no-unused-vars
  _onEventWhenConfChanged(_event: ConfigurationChangeEvent) {
    this.reloadConfig();
    if (this._couldUpdate()) {
      this._doUpdateComplete();
    } else {
      this.wordCounter.hide();
    }
  }

  reloadConfig() {
    const configuration = workspace.getConfiguration("wordcounter");
    this.languages = configuration.get("languages", []);

    const sideLeft = configuration.get("side.left", [
      "word",
      "char",
      "line",
      "paragraph",
      "readingtime",
    ]) as Counter[];
    const sideRight = configuration.get("side.right", []) as Counter[];
    const enabling = new Set<Counter>(Array.from(sideLeft).concat(sideRight));

    let config: WordCounterConfiguration = {
      countWords: enabling.has("word"),
      countChars: enabling.has("char"),
      countLines: enabling.has("line"),
      countParagraphs: enabling.has("paragraph"),
      readTime: enabling.has("readingtime"),
      simpleWordCount: configuration.get("simple_wordcount", true),
      includeEolChars: configuration.get("include_eol_chars", true),
      wpm: configuration.get("wpm", 200),
      sideLeft: sideLeft,
      sideRight: sideRight,
    } as WordCounterConfiguration;
    const text: TextConfig = {
      word: configuration.get("text.word"),
      words: configuration.get("text.words"),
      char: configuration.get("text.char"),
      chars: configuration.get("text.chars"),
      line: configuration.get("text.line"),
      lines: configuration.get("text.lines"),
      paragraph: configuration.get("text.paragraph"),
      paragraphs: configuration.get("text.paragraphs"),
      wordDelimiter: configuration.get("text.word_delimiter"),
      delimiter: configuration.get("text.delimiter"),
      readingTime: configuration.get("text.readingtime"),
    } as TextConfig;

    if (config.wpm < 1) {
      config.wpm = 200;
    }

    this.enabled =
      configuration.get("enabled", false) &&
      (config.countChars ||
        config.countLines ||
        config.countParagraphs ||
        config.countWords);

    this.wordCounter.updateConfiguration(config, text);
  }
}
