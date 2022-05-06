import { Disposable, window, workspace } from "vscode";
import {
  Counter,
  TextConfig,
  WordCounter,
  WordCounterConfiguration,
} from "./wordCounter";

export class WordCounterController {
  wordCounter: WordCounter;
  disposable: Disposable;
  enabled: boolean = false;
  languages: string[] = [];

  constructor(wordCounter: WordCounter) {
    this.wordCounter = wordCounter;
    this.reloadConfig();

    const subscriptions: Disposable[] = [];
    window.onDidChangeTextEditorSelection(this.onEvent, this, subscriptions);
    window.onDidChangeActiveTextEditor(this.onEvent, this, subscriptions);
    workspace.onDidChangeConfiguration(
      this.onEventWhenConfChanged,
      this,
      subscriptions
    );
    workspace.onDidChangeTextDocument(this.onEvent, this, subscriptions);

    this.onEvent();

    this.disposable = Disposable.from.apply(Disposable, subscriptions);
  }

  dispose() {
    this.disposable.dispose();
  }

  private onEvent() {
    if (
      this.enabled &&
      window.activeTextEditor &&
      (this.languages === null ||
        this.languages.includes(window.activeTextEditor.document.languageId))
    ) {
      this.wordCounter.update();
    } else {
      this.wordCounter.hide();
    }
  }

  private onEventWhenConfChanged() {
    this.reloadConfig();
    this.onEvent();
  }

  private reloadConfig() {
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
