import * as assert from 'assert';
import { beforeEach } from 'mocha';
import * as vscode from 'vscode';

import { WordCounter } from '../../wordCounter';

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
    assert.strictEqual(counter.wordCount(`
    one two three
    four five
    `), 5);
  });

  test('cyrillic', () => {
    assert.strictEqual(counter.wordCount(`
      один два три
      четыре Пять Ёлка
    `), 6);
  });

  test('mixed', () => {
    assert.strictEqual(counter.wordCount(`
      один two три
      four Пять ёлка
    `), 6);
  });

  test('hyphenated', () => {
    assert.strictEqual(counter.wordCount('test-hyphen'), 1);
    assert.strictEqual(counter.wordCount('что-то'), 1);
  });

  test('contracted', () => {
    assert.strictEqual(counter.wordCount(`I won't`), 2);
    assert.strictEqual(counter.wordCount(`д'Артаньян`), 1);
  });

  test('number', () => {
    assert.strictEqual(counter.wordCount('They sell 75 different products.'), 5);
    assert.strictEqual(counter.wordCount('Account 12345678, Sort Code 01-02-03'), 5);
    assert.strictEqual(counter.wordCount('Item 06: 87,334.67'), 3);
  });

  test('non-words', () => {
    assert.strictEqual(counter.wordCount('one - two ; three'), 5);
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
    assert.strictEqual(counter.wordCount(`
    one two three
    four five
    `), 5);
  });

  test('cyrillic', () => {
    assert.strictEqual(counter.wordCount(`
      один два три
      четыре Пять Ёлка
    `), 6);
  });

  test('mixed', () => {
    assert.strictEqual(counter.wordCount(`
      один two три
      four Пять ёлка
    `), 6);
  });

  test('hyphenated', () => {
    assert.strictEqual(counter.wordCount('test-hyphen'), 1);
    assert.strictEqual(counter.wordCount('что-то'), 1);
  });

  test('contracted', () => {
    assert.strictEqual(counter.wordCount(`I won't`), 2);
    assert.strictEqual(counter.wordCount(`д'Артаньян`), 1);
  });

  test('number', () => {
    assert.strictEqual(counter.wordCount('They sell 75 different products.'), 5);
    assert.strictEqual(counter.wordCount('Account 12345678, Sort Code 01-02-03'), 5);
    assert.strictEqual(counter.wordCount('Item 06: 87,334.67'), 3);
  });

  test('non-words', () => {
    assert.strictEqual(counter.wordCount('one - two ; three'), 3);
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
    assert.strictEqual(counter.lineCount(`
    one two three
    four five
    `, true, {} as vscode.TextDocument), 4);
  });

  test('cyrillic', () => {
    assert.strictEqual(counter.lineCount(`
      один два три
      четыре Пять Ёлка
    `, true, {} as vscode.TextDocument), 4);
  });

  test('mixed', () => {
    assert.strictEqual(counter.lineCount(`
      один two три
      four Пять ёлка
    `, true, {} as vscode.TextDocument), 4);
  });

  test('hyphenated', () => {
    assert.strictEqual(counter.lineCount('test-hyphen', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount('что-то', true, {} as vscode.TextDocument), 1);
  });

  test('contracted', () => {
    assert.strictEqual(counter.lineCount(`I won't`, true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount(`д'Артаньян`, true, {} as vscode.TextDocument), 1);
  });

  test('number', () => {
    assert.strictEqual(counter.lineCount('They sell 75 different products.', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount('Account 12345678, Sort Code 01-02-03', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount('Item 06: 87,334.67', true, {} as vscode.TextDocument), 1);
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
    assert.strictEqual(counter.paragraphCount('', currentEOF), 0);
  });

  test('Empty lines', () => {
    const lines = `


`;
    assert.strictEqual(counter.paragraphCount(lines, currentEOF), 0);
  });

  test('latin', () => {
    assert.strictEqual(counter.paragraphCount(`
    one two three
    four five
    `, currentEOF), 1);
  });

  test('cyrillic', () => {
    assert.strictEqual(counter.paragraphCount(`
      один два три
      четыре Пять Ёлка
    `, currentEOF), 1);
  });

  test('mixed', () => {
    assert.strictEqual(counter.paragraphCount(`
      один two три
      four Пять ёлка
    `, currentEOF), 1);
  });

  test('hyphenated', () => {
    assert.strictEqual(counter.paragraphCount('test-hyphen', currentEOF), 1);
    assert.strictEqual(counter.paragraphCount('что-то', currentEOF), 1);
  });

  test('contracted', () => {
    assert.strictEqual(counter.paragraphCount(`I won't`, currentEOF), 1);
    assert.strictEqual(counter.paragraphCount(`д'Артаньян`, currentEOF), 1);
  });

  test('number', () => {
    assert.strictEqual(counter.paragraphCount('They sell 75 different products.', currentEOF), 1);
    assert.strictEqual(counter.paragraphCount('Account 12345678, Sort Code 01-02-03', currentEOF), 1);
    assert.strictEqual(counter.paragraphCount('Item 06: 87,334.67', currentEOF), 1);
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
    assert.strictEqual(counter.charCount('', currentEOF), 0);
  });

  test('Empty lines', () => {
    const lines = `


`;
    assert.strictEqual(counter.charCount(lines, currentEOF), 0);
  });

  test('Some lines', () => {
    const lines = `123
567

89`;
    assert.strictEqual(counter.charCount(lines, currentEOF), 8);
  });

});
