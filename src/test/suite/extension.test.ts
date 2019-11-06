import * as assert from 'assert';
import { beforeEach } from 'mocha';
import * as vscode from 'vscode';

import { WordCounter } from '../../wordCounter';

suite('Wordcounter.wordCount()', () => {
  let counter: WordCounter;

  vscode.window.showInformationMessage('Start wordCount() tests.');

  beforeEach(function () {
    counter = new WordCounter();
    counter.count_words = true;
  });

  // Defines a Mocha unit test
  test('latin', function () {
    assert.strictEqual(counter.wordCount(`
    one two three
    four five
    `), 5);
  });

  test('cyrillic', function () {
    assert.strictEqual(counter.wordCount(`
      один два три
      четыре Пять Ёлка
    `), 6);
  });

  test('mixed', function () {
    assert.strictEqual(counter.wordCount(`
      один two три
      four Пять ёлка
    `), 6);
  });

  test('hyphenated', function () {
    assert.strictEqual(counter.wordCount('test-hyphen'), 1);
    assert.strictEqual(counter.wordCount('что-то'), 1);
  });

  test('contracted', function () {
    assert.strictEqual(counter.wordCount(`I won't`), 2);
    assert.strictEqual(counter.wordCount(`д'Артаньян`), 1);
  });

  test('number', function () {
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

  beforeEach(function () {
    counter = new WordCounter();
    counter.count_lines = true;
  });

  // Defines a Mocha unit test
  test('latin', function () {
    assert.strictEqual(counter.lineCount(`
    one two three
    four five
    `, true, {} as vscode.TextDocument), 4);
  });

  test('cyrillic', function () {
    assert.strictEqual(counter.lineCount(`
      один два три
      четыре Пять Ёлка
    `, true, {} as vscode.TextDocument), 4);
  });

  test('mixed', function () {
    assert.strictEqual(counter.lineCount(`
      один two три
      four Пять ёлка
    `, true, {} as vscode.TextDocument), 4);
  });

  test('hyphenated', function () {
    assert.strictEqual(counter.lineCount('test-hyphen', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount('что-то', true, {} as vscode.TextDocument), 1);
  });

  test('contracted', function () {
    assert.strictEqual(counter.lineCount(`I won't`, true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount(`д'Артаньян`, true, {} as vscode.TextDocument), 1);
  });

  test('number', function () {
    assert.strictEqual(counter.lineCount('They sell 75 different products.', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount('Account 12345678, Sort Code 01-02-03', true, {} as vscode.TextDocument), 1);
    assert.strictEqual(counter.lineCount('Item 06: 87,334.67', true, {} as vscode.TextDocument), 1);
  });

});

suite('Wordcounter.paragraphCount()', () => {
  let counter: WordCounter;

  vscode.window.showInformationMessage('Start paragraphCount() tests.');

  beforeEach(function () {
    counter = new WordCounter();
    counter.count_paragraphs = true;
  });

  // Defines a Mocha unit test
  test('latin', function () {
    assert.strictEqual(counter.paragraphCount(`
    one two three
    four five
    `, vscode.EndOfLine.CRLF), 1);
  });

  test('cyrillic', function () {
    assert.strictEqual(counter.paragraphCount(`
      один два три
      четыре Пять Ёлка
    `, vscode.EndOfLine.CRLF), 1);
  });

  test('mixed', function () {
    assert.strictEqual(counter.paragraphCount(`
      один two три
      four Пять ёлка
    `, vscode.EndOfLine.CRLF), 1);
  });

  test('hyphenated', function () {
    assert.strictEqual(counter.paragraphCount('test-hyphen', vscode.EndOfLine.CRLF), 1);
    assert.strictEqual(counter.paragraphCount('что-то', vscode.EndOfLine.CRLF), 1);
  });

  test('contracted', function () {
    assert.strictEqual(counter.paragraphCount(`I won't`, vscode.EndOfLine.CRLF), 1);
    assert.strictEqual(counter.paragraphCount(`д'Артаньян`, vscode.EndOfLine.CRLF), 1);
  });

  test('number', function () {
    assert.strictEqual(counter.paragraphCount('They sell 75 different products.', vscode.EndOfLine.CRLF), 1);
    assert.strictEqual(counter.paragraphCount('Account 12345678, Sort Code 01-02-03', vscode.EndOfLine.CRLF), 1);
    assert.strictEqual(counter.paragraphCount('Item 06: 87,334.67', vscode.EndOfLine.CRLF), 1);
  });

});
