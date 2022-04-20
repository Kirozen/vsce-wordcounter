import {
  ConfigurationChangeEvent,
  Disposable,
  EndOfLine,
  TextDocumentChangeEvent,
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

  _onDidChangeActiveTextEditor(event: any) {
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

  _onEventWhenConfChanged(event: ConfigurationChangeEvent) {
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

    const side_left = configuration.get("side.left", [
      "word",
      "char",
      "line",
      "paragraph",
      "readingtime",
    ]) as Counter[];
    const side_right = configuration.get("side.right", []) as Counter[];
    const enabling = new Set<Counter>(Array.from(side_left).concat(side_right));

    let config: WordCounterConfiguration = {
      count_words: enabling.has("word"),
      count_chars: enabling.has("char"),
      count_lines: enabling.has("line"),
      count_paragraphs: enabling.has("paragraph"),
      readtime: enabling.has("readingtime"),
      simple_wordcount: configuration.get("simple_wordcount", true),
      include_eol_chars: configuration.get("include_eol_chars", true),
      wpm: configuration.get("wpm", 200),
      side_left,
      side_right,
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
      word_delimiter: configuration.get("text.word_delimiter"),
      delimiter: configuration.get("text.delimiter"),
      readingtime: configuration.get("text.readingtime"),
    } as TextConfig;

    if (config.wpm < 1) {
      config.wpm = 200;
    }

    this.enabled =
      configuration.get("enabled", false) &&
      (config.count_chars ||
        config.count_lines ||
        config.count_paragraphs ||
        config.count_words);

    this.wordCounter.updateConfiguration(config, text);
  }
}
