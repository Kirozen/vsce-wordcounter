import * as assert from 'assert';
import { beforeEach } from 'mocha';
import * as vscode from 'vscode';

import { charCount, lineCount, paragraphCount, wordCount, WordCounter } from '../../wordCounter';

const currentEOF = `
`.search(/\r\n/) >= 0 ? vscode.EndOfLine.CRLF : vscode.EndOfLine.LF;

suite('Wordcounter.wordCount()', () => {
  let counter: WordCounter;

  vscode.window.showInformationMessage('Start wordCount() tests.');

  beforeEach(() => {
    counter = new WordCounter();
    counter.config.count_words = true;
    counter.config.simple_wordcount = true;
  });

  // Defines a Mocha unit test
  test('latin', () => {
    assert.strictEqual(wordCount(`
    one two three
    four five
    `, true), 5);
  });

  test('cyrillic', () => {
    assert.strictEqual(wordCount(`
      один два три
      четыре Пять Ёлка
    `, true), 6);
  });

  test('mixed', () => {
    assert.strictEqual(wordCount(`
      один two три
      four Пять ёлка
    `, true), 6);
  });

  test('hyphenated', () => {
    assert.strictEqual(wordCount('test-hyphen', true), 1);
    assert.strictEqual(wordCount('что-то', true), 1);
  });

  test('contracted', () => {
    assert.strictEqual(wordCount(`I won't`, true), 2);
    assert.strictEqual(wordCount(`д'Артаньян`, true), 1);
  });

  test('number', () => {
    assert.strictEqual(wordCount('They sell 75 different products.', true), 5);
    assert.strictEqual(wordCount('Account 12345678, Sort Code 01-02-03', true), 5);
    assert.strictEqual(wordCount('Item 06: 87,334.67', true), 3);
  });

  test('non-words', () => {
    assert.strictEqual(wordCount('one - two ; three', true), 5);
  });

});

suite('Wordcounter.wordCount() not simple', () => {
  let counter: WordCounter;

  vscode.window.showInformationMessage('Start wordCount() not simple tests.');

  beforeEach(() => {
    counter = new WordCounter();
    counter.config.count_words = true;
    counter.config.simple_wordcount = false;
  });

  // Defines a Mocha unit test
  test('latin', () => {
    assert.strictEqual(wordCount(`
    one two three
    four five
    `, true), 5);
  });

  test('cyrillic', () => {
    assert.strictEqual(wordCount(`
      один два три
      четыре Пять Ёлка
    `, true), 6);
  });

  test('mixed', () => {
    assert.strictEqual(wordCount(`
      один two три
      four Пять ёлка
    `, true), 6);
  });

  test('hyphenated', () => {
    assert.strictEqual(wordCount('test-hyphen', true), 1);
    assert.strictEqual(wordCount('что-то', true), 1);
  });

  test('contracted', () => {
    assert.strictEqual(wordCount(`I won't`, true), 2);
    assert.strictEqual(wordCount(`д'Артаньян`, true), 1);
  });

  test('number', () => {
    assert.strictEqual(wordCount('They sell 75 different products.', true), 5);
    assert.strictEqual(wordCount('Account 12345678, Sort Code 01-02-03', true), 5);
    assert.strictEqual(wordCount('Item 06: 87,334.67', true), 3);
  });

  test('non-words', () => {
    assert.strictEqual(wordCount('one - two ; three', true), 3);
  });

});

suite('Wordcounter.lineCount()', () => {
  let counter: WordCounter;

  vscode.window.showInformationMessage('Start lineCount() tests.');

  beforeEach(() => {
    counter = new WordCounter();
    counter.config.count_lines = true;
  });

  // Defines a Mocha unit test
  test('latin', () => {
    assert.strictEqual(lineCount(`
    one two three
    four five
    `, true, {} as vscode.TextDocument), 4);
  });

  test('cyrillic', () => {
    assert.strictEqual(lineCount(`
      один два три
      четыре Пять Ёлка
    `, true, {} as vscode.TextDocument), 4);
  });

  test('mixed', () => {
    assert.strictEqual(lineCount(`
      один two три
      four Пять ёлка
    `, true, {} as vscode.TextDocument), 4);
  });

  test('hyphenated', () => {
    assert.strictEqual(lineCount('test-hyphen', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(lineCount('что-то', true, {} as vscode.TextDocument), 1);
  });

  test('contracted', () => {
    assert.strictEqual(lineCount(`I won't`, true, {} as vscode.TextDocument), 1);
    assert.strictEqual(lineCount(`д'Артаньян`, true, {} as vscode.TextDocument), 1);
  });

  test('number', () => {
    assert.strictEqual(lineCount('They sell 75 different products.', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(lineCount('Account 12345678, Sort Code 01-02-03', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(lineCount('Item 06: 87,334.67', true, {} as vscode.TextDocument), 1);
  });

});

suite('Wordcounter.paragraphCount()', () => {
  let counter: WordCounter;

  vscode.window.showInformationMessage('Start paragraphCount() tests.');

  beforeEach(() => {
    counter = new WordCounter();
    counter.config.count_paragraphs = true;
  });

  test('Empty line', () => {
    assert.strictEqual(paragraphCount('', currentEOF), 0);
  });

  test('Empty lines', () => {
    const lines = `


`;
    assert.strictEqual(paragraphCount(lines, currentEOF), 0);
  });

  test('latin', () => {
    assert.strictEqual(paragraphCount(`
    one two three
    four five
    `, currentEOF), 1);
  });

  test('cyrillic', () => {
    assert.strictEqual(paragraphCount(`
      один два три
      четыре Пять Ёлка
    `, currentEOF), 1);
  });

  test('mixed', () => {
    assert.strictEqual(paragraphCount(`
      один two три
      four Пять ёлка
    `, currentEOF), 1);
  });

  test('hyphenated', () => {
    assert.strictEqual(paragraphCount('test-hyphen', currentEOF), 1);
    assert.strictEqual(paragraphCount('что-то', currentEOF), 1);
  });

  test('contracted', () => {
    assert.strictEqual(paragraphCount(`I won't`, currentEOF), 1);
    assert.strictEqual(paragraphCount(`д'Артаньян`, currentEOF), 1);
  });

  test('number', () => {
    assert.strictEqual(paragraphCount('They sell 75 different products.', currentEOF), 1);
    assert.strictEqual(paragraphCount('Account 12345678, Sort Code 01-02-03', currentEOF), 1);
    assert.strictEqual(paragraphCount('Item 06: 87,334.67', currentEOF), 1);
  });

});

suite('Wordcounter.charCount() without eol chars', () => {
  let counter: WordCounter;

  vscode.window.showInformationMessage('Start charCount() without eol chars tests.');

  beforeEach(() => {
    counter = new WordCounter();
    counter.config.include_eol_chars = false;
  });

  test('Empty line', () => {
    assert.strictEqual(charCount(true, '', currentEOF), 0);
  });

  test('Empty lines', () => {
    const lines = `


`;
    assert.strictEqual(charCount(true, lines, currentEOF), 0);
  });

  test('Some lines', () => {
    const lines = `123
567

89`;
    assert.strictEqual(charCount(true, lines, currentEOF), 8);
  });

});
