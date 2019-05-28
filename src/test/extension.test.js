/* global suite, test, beforeEach*/

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
var assert = require('assert')
var beforeEach = require('mocha').beforeEach;
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
var vscode = require('vscode')
var myExtension = require('../extension')
var wordCounter = require('../wordCounter');
// Defines a Mocha test suite to group tests of similar kind together
suite('Wordcounter.wordCount()', function () {
  var counter;
  beforeEach(function() {
    counter = new wordCounter.WordCounter();
    counter.count_words = true;
  });
  // Defines a Mocha unit test
  test('latin', function () {
    assert.equal(counter.wordCount(`
    one two three
    four five 
    `), 5);
  });
  test('cyrillic', function () {
    assert.equal(counter.wordCount(`
      один два три
      четыре Пять Ёлка
    `), 6);
  });
  test('mixed', function () {
    assert.equal(counter.wordCount(`
      один two три
      four Пять ёлка
    `), 6);
  });
  test('hyphenated', function() {
    assert.equal(counter.wordCount('test-hyphen'), 1);
    assert.equal(counter.wordCount('что-то'), 1);
  });
  test('contracted', function() {
    assert.equal(counter.wordCount(`I won't`), 2);
    assert.equal(counter.wordCount(`д'Артаньян`), 1);
  });
})
