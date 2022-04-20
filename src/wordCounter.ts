import {
  EndOfLine,
  Selection,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
  window,
} from "vscode";

export interface TextConfig {
  word: string;
  words: string;
  char: string;
  chars: string;
  line: string;
  lines: string;
  paragraph: string;
  paragraphs: string;
  wordDelimiter: string;
  delimiter: string;
  readingTime: string;
}

export interface WordCounterConfiguration {
  countWords: boolean;
  countChars: boolean;
  countLines: boolean;
  countParagraphs: boolean;
  readTime: boolean;
  simpleWordCount: boolean;
  includeEolChars: boolean;
  wpm: number;
  sideLeft: Counter[];
  sideRight: Counter[];
}

export interface DisplayData {
  words: number;
  chars: number;
  lines: number;
  paragraphs: number;
}

export type Counter = "word" | "char" | "line" | "paragraph" | "readingtime";

const WORD_RE: RegExp = /[\S]+/g;
const WORD_SUB_RE: RegExp = /[\w\u0370-\uffef]+/;
const CRLF_RE = {
  split: /\r\n[\r\n]+/,
  replace: /\r\n/g,
};
const LF_RE = {
  split: /\n\n+/,
  replace: /\n/g,
};

export class WordCounter {
  statusBarItemLeft: StatusBarItem;
  statusBarItemRight: StatusBarItem;

  text: TextConfig = {} as TextConfig;
  config: WordCounterConfiguration = {} as WordCounterConfiguration;

  constructor() {
    this.statusBarItemLeft = window.createStatusBarItem(
      StatusBarAlignment.Left
    );
    this.statusBarItemRight = window.createStatusBarItem(
      StatusBarAlignment.Right
    );
  }

  hide() {
    this.statusBarItemLeft.hide();
    this.statusBarItemRight.hide();
  }

  dispose() {
    this.statusBarItemLeft.dispose();
    this.statusBarItemRight.dispose();
  }

  updateConfiguration(
    configuration: WordCounterConfiguration,
    text: TextConfig
  ) {
    this.config = configuration;
    this.text = text;
  }

  update(fromSelection: boolean = true) {
    if (!this.statusBarItemLeft) {
      this.statusBarItemLeft = window.createStatusBarItem(
        StatusBarAlignment.Left
      );
    }
    if (!this.statusBarItemRight) {
      this.statusBarItemRight = window.createStatusBarItem(
        StatusBarAlignment.Right
      );
    }

    const editor = window.activeTextEditor;
    if (!editor) {
      this.statusBarItemLeft.hide();
      this.statusBarItemRight.hide();
      return;
    }

    let displayData: DisplayData = {} as DisplayData;
    if (
      fromSelection &&
      editor.selections.length === 1 &&
      !editor.selection.isEmpty
    ) {
      displayData = this.countSelectedSimple(editor.document, editor.selection);
    } else if (fromSelection && editor.selections.length > 1) {
      displayData = this.countSelectedMultiple(
        editor.document,
        editor.selections
      );
    } else {
      displayData = this.countAll(editor.document);
    }

    this.statusBarItemLeft.text = this.prepareStatusBar(
      displayData,
      StatusBarAlignment.Left
    );
    this.statusBarItemRight.text = this.prepareStatusBar(
      displayData,
      StatusBarAlignment.Right
    );

    this.statusBarItemLeft.show();
    this.statusBarItemRight.show();
  }

  countSelectedSimple(doc: TextDocument, selection: Selection) {
    var content = doc.getText(selection.with());
    return this.computeDisplayData(doc, content, true);
  }

  countAll(doc: TextDocument) {
    var content = doc.getText();
    return this.computeDisplayData(doc, content, false);
  }

  countSelectedMultiple(doc: TextDocument, selections: readonly Selection[]) {
    let words = 0,
      chars = 0,
      paragraphs = 0,
      lines = 0;

    selections.forEach((selection) => {
      const content = doc.getText(selection.with());

      if (this.config.countWords || this.config.readTime) {
        words += wordCount(content, this.config.simpleWordCount);
      }

      if (this.config.countParagraphs) {
        paragraphs += paragraphCount(content, doc.eol);
      }

      if (this.config.countChars) {
        chars += content.length;
      }

      if (this.config.countLines) {
        if (selection.isSingleLine) {
          lines++;
        } else {
          lines += selection.end.line - selection.start.line + 1;
        }
      }
    });

    return {
      words: words,
      chars: chars,
      lines: lines,
      paragraphs: paragraphs,
    } as DisplayData;
  }

  computeDisplayData(
    doc: TextDocument,
    content: string,
    hasSelectedText: boolean
  ) {
    let words = 0,
      chars = 0,
      paragraphs = 0,
      lines = 0;
    if (this.config.countWords || this.config.readTime) {
      words = wordCount(content, this.config.simpleWordCount);
    }

    if (this.config.countParagraphs) {
      paragraphs = paragraphCount(content, doc.eol);
    }

    if (this.config.countChars) {
      chars = charCount(this.config.includeEolChars, content, doc.eol);
    }

    if (this.config.countLines) {
      lines = lineCount(content, hasSelectedText, doc);
    }

    return {
      words: words,
      chars: chars,
      lines: lines,
      paragraphs: paragraphs,
    } as DisplayData;
  }

  prepareStatusBar(displayData: DisplayData, alignment: StatusBarAlignment) {
    const order =
      alignment === StatusBarAlignment.Left
        ? this.config.sideLeft
        : this.config.sideRight;
    const wordText = displayData.words === 1 ? this.text.word : this.text.words;
    const charText = displayData.chars === 1 ? this.text.char : this.text.chars;
    const lineText = displayData.lines === 1 ? this.text.line : this.text.lines;
    const paragraphText =
      displayData.paragraphs === 1 ? this.text.paragraph : this.text.paragraphs;
    const map = {
      word: `${displayData.words}${this.text.wordDelimiter}${wordText}`,
      char: `${displayData.chars}${this.text.wordDelimiter}${charText}`,
      line: `${displayData.lines}${this.text.wordDelimiter}${lineText}`,
      paragraph: `${displayData.paragraphs}${this.text.wordDelimiter}${paragraphText}`,
    } as Record<Counter, string>;

    if (this.config.readTime && order.includes("readingtime")) {
      const div = displayData.words / this.config.wpm;
      const m = Math.floor(div);
      const s = Math.round(60 * (div - m));
      map["readingtime"] = `~${m}m${s}s ${this.text.readingTime}`;
    }

    return order.map((key) => map[key]).join(this.text.delimiter);
  }
}

export function charCount(
  includeEolChars: boolean,
  content: string,
  linefeed: EndOfLine
) {
  if (includeEolChars) {
    return content.length;
  }
  const re = linefeed === EndOfLine.CRLF ? CRLF_RE.replace : LF_RE.replace;
  return content.replace(re, "").length;
}

export function paragraphCount(content: string, linefeed: EndOfLine) {
  if (content) {
    const re = linefeed === EndOfLine.CRLF ? CRLF_RE : LF_RE;
    return content
      .split(re.split)
      .map((p) => p.replace(re.replace, ""))
      .filter((p) => p.length > 0).length;
  }
  return 0;
}

export function lineCount(
  content: string,
  hasSelectedText: boolean,
  doc: TextDocument
) {
  if (hasSelectedText) {
    return content.split("\n").length;
  }
  return doc.lineCount;
}

export function wordCount(content: string, simpleWordCount: boolean) {
  if (!content) {
    return 0;
  }

  const matches = content.match(WORD_RE);
  if (matches) {
    if (!simpleWordCount) {
      return matches.filter((s) => {
        const submatches = s.match(WORD_SUB_RE);
        return submatches ? submatches.length > 0 : false;
      }).length;
    }
    return matches.length;
  }
  return 0;
}
