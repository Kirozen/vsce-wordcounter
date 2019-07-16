# WordCounter README

[VSCode](https://code.visualstudio.com/) extension which show in real time:

* number of words
* number of chars
* number of lines
* number of paragraphs
* estimated read time

Support multiple selection.

Inspired by SublimeText WordCount plugin.

## Dependencies

* lodash

## Extension Settings

This extension contributes the following settings:

* `wordcounter.enable`: enable/disable this extension (true/false)
* `wordcounter.count_words`: enable/disable word counter (true/false)
* `wordcounter.count_chars`: enable/disable char counter (true/false)
* `wordcounter.count_lines`: enable/disable line counter (true/false)
* `wordcounter.count_paragraphs`: enable/disable paragraph counter (true/false)
* `wordcounter.languages`: enable this extension for these specific languages, or all if null (default=null, list of supported languages)
* `wordcounter.readtime`: enable/disable read time functionality (true/false)
* `wordcounter.wpm`: words per minute (default=200)
* `wordcounter.text.word`: text for "Word"
* `wordcounter.text.words`: text for "Words"
* `wordcounter.text.line`: text for "Line"
* `wordcounter.text.lines`: text for "Lines"
* `wordcounter.text.paragraph`: text for "Paragraph"
* `wordcounter.text.paragraphs`: text for "Paragraphs"
* `wordcounter.text.char`: text for "Char"
* `wordcounter.text.chars`: text for "Chars"
* `wordcounter.text.reading`: text for "reading time"
* `wordcounter.text.delimiter`: text for ", "
* `wordcounter.text.word_delimiter`: text for spacing between items " "

## Known Issues

In multi-selection mode, paragraphs are not well counted => #21

## Release Notes

### 1.9.3

* Fix #20: Numbers are not counted as words when they should be
* Update dependencies

### 1.9.2

* Fix #19: The accented words counted as two words
* Handle correctly unicode

### 1.9.1

* Fix #18: Counting words by highlighted selection is not working
* Fix line count in multi selection

### 1.9.0

* Fix #5: Add a counter for paragraphs
* Small optimizations

### 1.8.2

* Fix languages parameter issue

### 1.8.0

* Add languages option

### 1.7.0

* Fix regex
* ES6
* Reduce extension size

### 1.6.0

* Update dependencies
* Fix #14: Hyphenated words / contractions counted as two words

### 1.5.0

* Fix word counting

### 1.4.0

* Rewrite to es5, following standardjs
* Added the configuration option for choosing text

### 1.3.0

* Fix #6: Support multiple selections
* Fix #7: can't see total word count after selecting then deselecting text
* Fix #8: reading time below 1 min

### 1.2.2

* Fix character count when changing line endings between lf and crlf
* Some optimizations

### 1.2.1

* Fix text on status bar ('0 Word, 0 Char' should read '0 Words, 0 Chars')

### 1.2.0

* Report stats on selected text

### 1.1.0

* Add **reading time** functionality
* Add options
* Reload options automatically when workspace configuration is modified

### 1.0.0

Initial release of WordCounter

## Contributors

* Etienne Faisant
* Jonathan T L Lee
* Artboomy
