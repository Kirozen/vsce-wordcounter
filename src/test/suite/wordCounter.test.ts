import { expect } from "chai";
import { describe, it } from "mocha";
import {
  charCount,
  lineCount,
  paragraphCount,
  wordCount,
} from "../../wordCounter";
import * as vscode from "vscode";

const CURRENT_EOF =
  `
`.search(/\r\n/) >= 0
    ? vscode.EndOfLine.CRLF
    : vscode.EndOfLine.LF;

describe("wordCount", () => {
  it("latin", () => {
    const str = `
    one two three
    four five
    `;
    expect(wordCount(str, true)).to.equal(5);
  });

  it("cyrillic", () => {
    const str = `
      один два три
      четыре Пять Ёлка
    `;
    expect(wordCount(str, true)).to.equal(6);
  });

  it("mixed", () => {
    const str = `
      один two три
      four Пять ёлка
    `;
    expect(wordCount(str, true)).to.equal(6);
  });

  it("hyphenated", () => {
    expect(wordCount("test-hyphen", true)).to.equal(1);
    expect(wordCount("что-то", true)).to.equal(1);
  });

  it("contracted", () => {
    expect(wordCount(`I won't`, true)).to.equal(2);
    expect(wordCount(`д'Артаньян`, true)).to.equal(1);
  });

  it("number", () => {
    expect(wordCount("They sell 75 different products.", true)).to.equal(5);
    const str2 = "Account 12345678, Sort Code 01-02-03";
    expect(wordCount(str2, true)).to.equal(5);
    expect(wordCount("Item 06: 87,334.67", true)).to.equal(3);
  });

  it("non-words", () => {
    expect(wordCount("one - two ; three", true)).to.equal(5);
  });
});

describe("wordCount not simple", () => {
  it("latin", () => {
    const str = `
  one two three
  four five
    `;
    expect(wordCount(str, false)).to.equal(5);
  });

  it("cyrillic", () => {
    const str = `
      один два три
      четыре Пять Ёлка
    `;
    expect(wordCount(str, false)).to.equal(6);
  });

  it("mixed", () => {
    const str = `
      один two три
      four Пять ёлка
    `;
    expect(wordCount(str, false)).to.equal(6);
  });

  it("hyphenated", () => {
    expect(wordCount("test-hyphen", false)).to.equal(1);
    expect(wordCount("что-то", false)).to.equal(1);
  });

  it("contracted", () => {
    expect(wordCount(`I won't`, false)).to.equal(2);
    expect(wordCount(`д'Артаньян`, false)).to.equal(1);
  });

  it("number", () => {
    expect(wordCount("They sell 75 different products.", false)).to.equal(5);
    const str = "Account 12345678, Sort Code 01-02-03";
    expect(wordCount(str, false)).to.equal(5);
    expect(wordCount("Item 06: 87,334.67", false)).to.equal(3);
  });

  it("non-words", () => {
    expect(wordCount("one - two ; three", false)).to.equal(3);
  });
});

describe("lineCount", () => {
  it("latin", () => {
    const str = `
      one two three
      four five
      `;
    expect(lineCount(str, true, {} as vscode.TextDocument)).to.equal(4);
  });

  it("cyrillic", () => {
    const str = `
      один два три
      четыре Пять Ёлка
    `;
    expect(lineCount(str, true, {} as vscode.TextDocument)).to.equal(4);
  });

  it("mixed", () => {
    const str = `
      один two три
      four Пять ёлка
    `;
    expect(lineCount(str, true, {} as vscode.TextDocument)).to.equal(4);
  });

  it("hyphenated", () => {
    expect(lineCount("test-hyphen", true, {} as vscode.TextDocument)).to.equal(
      1
    );
    expect(lineCount("что-то", true, {} as vscode.TextDocument)).to.equal(1);
  });

  it("contracted", () => {
    expect(lineCount(`I won't`, true, {} as vscode.TextDocument)).to.equal(1);
    const str = `д'Артаньян`;
    expect(lineCount(str, true, {} as vscode.TextDocument)).to.equal(1);
  });

  it("number", () => {
    let str = "They sell 75 different products.";
    expect(lineCount(str, true, {} as vscode.TextDocument)).to.equal(1);
    str = "Account 12345678, Sort Code 01-02-03";
    expect(lineCount(str, true, {} as vscode.TextDocument)).to.equal(1);
    str = "Item 06: 87,334.67";
    expect(lineCount(str, true, {} as vscode.TextDocument)).to.equal(1);
  });
});

describe("paragraphCount", () => {
  it("Empty line", () => {
    expect(paragraphCount("", CURRENT_EOF)).to.equal(0);
  });

  it("Empty lines", () => {
    const lines = `


`;
    expect(paragraphCount(lines, CURRENT_EOF)).to.equal(0);
  });

  it("latin", () => {
    const str = `
    one two three
    four five
    `;
    expect(paragraphCount(str, CURRENT_EOF)).to.equal(1);
  });

  it("cyrillic", () => {
    const str = `
      один два три
      четыре Пять Ёлка
    `;
    expect(paragraphCount(str, CURRENT_EOF)).to.equal(1);
  });

  it("mixed", () => {
    const str = `
      один two три
      four Пять ёлка
    `;
    expect(paragraphCount(str, CURRENT_EOF)).to.equal(1);
  });

  it("hyphenated", () => {
    expect(paragraphCount("test-hyphen", CURRENT_EOF)).to.equal(1);
    expect(paragraphCount("что-то", CURRENT_EOF)).to.equal(1);
  });

  it("contracted", () => {
    expect(paragraphCount(`I won't`, CURRENT_EOF)).to.equal(1);
    expect(paragraphCount(`д'Артаньян`, CURRENT_EOF)).to.equal(1);
  });

  it("number", () => {
    let str = "They sell 75 different products.";
    expect(paragraphCount(str, CURRENT_EOF)).to.equal(1);
    str = "Account 12345678, Sort Code 01-02-03";
    expect(paragraphCount(str, CURRENT_EOF)).to.equal(1);
    expect(paragraphCount("Item 06: 87,334.67", CURRENT_EOF)).to.equal(1);
  });
});

describe("charCount without eol chars", () => {
  it("Empty line", () => {
    expect(charCount(false, "", CURRENT_EOF)).to.equal(0);
  });

  it("Empty lines", () => {
    const lines = `


`;
    expect(charCount(false, lines, CURRENT_EOF)).to.equal(0);
  });

  it("Some lines", () => {
    const lines = `123
567

89`;
    expect(charCount(false, lines, CURRENT_EOF)).to.equal(8);
  });
});
