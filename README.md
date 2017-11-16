# WordCounter README

[VSCode](https://code.visualstudio.com/) extension which show in real time:

* number of words
* number of chars
* number of lines
* estimated read time

Inspired by SublimeText WordCount plugin.

## Requirements

It does not require anything ;-)

## Extension Settings

This extension contributes the following settings:

* `wordcounter.enable`: enable/disable this extension (true/false)
* `wordcounter.count_words`: enable/disable word counter (true/false)
* `wordcounter.count_chars`: enable/disable char counter (true/false)
* `wordcounter.count_lines`: enable/disable line counter (true/false)
* `wordcounter.readtime`: enable/disable read time functionality (true/false)
* `wordcounter.wpm`: words per minute (default=200)

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

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
