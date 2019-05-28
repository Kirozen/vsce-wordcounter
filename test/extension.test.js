/* global suite, test */
import { strictEqual } from 'assert';
import { beforeEach } from 'mocha';

import { WordCounter } from '../src/wordCounter';


//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// Defines a Mocha test suite to group tests of similar kind together
suite('Wordcounter.wordCount()', function () {
  var counter = null;

  beforeEach(function () {
    counter = new WordCounter();
    counter.count_words = true;
  });

  // Defines a Mocha unit test
  test('latin', function () {
    strictEqual(counter.wordCount(`
    one two three
    four five
    `), 5);
  });

  test('cyrillic', function () {
    strictEqual(counter.wordCount(`
      один два три
      четыре Пять Ёлка
    `), 6);
  });

  test('mixed', function () {
    strictEqual(counter.wordCount(`
      один two три
      four Пять ёлка
    `), 6);
  });

  test('hyphenated', function () {
    strictEqual(counter.wordCount('test-hyphen'), 1);
    strictEqual(counter.wordCount('что-то'), 1);
  });

  test('contracted', function () {
    strictEqual(counter.wordCount(`I won't`), 2);
    strictEqual(counter.wordCount(`д'Артаньян`), 1);
  });

});
