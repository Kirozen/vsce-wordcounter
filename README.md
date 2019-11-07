# WordCounter README

[VSCode](https://code.visualstudio.com/) extension which show in real time:

* number of words
* number of chars
* number of lines
* number of paragraphs
* estimated read time

Support multiple selection.

Inspired by SublimeText WordCount plugin.

## Extension Settings

This extension contributes the following settings:

* `wordcounter.enable` : enable/disable this extension (true/false)
* `wordcounter.count_words` : enable/disable word counter (true/false)
* `wordcounter.count_chars` : enable/disable char counter (true/false)
* `wordcounter.count_lines` : enable/disable line counter (true/false)
* `wordcounter.count_paragraphs` : enable/disable paragraph counter (true/false)
* `wordcounter.simple_wordcount` : enable/disable simple word count algorithm (true/false)
* `wordcounter.languages` : enable this extension for these specific languages, or all if null (default=null, list of supported languages)
* `wordcounter.readtime` : enable/disable read time functionality (true/false)
* `wordcounter.wpm` : words per minute (default=200)
* `wordcounter.text.word` : text for "Word"
* `wordcounter.text.words` : text for "Words"
* `wordcounter.text.line` : text for "Line"
* `wordcounter.text.lines` : text for "Lines"
* `wordcounter.text.paragraph` : text for "Paragraph"
* `wordcounter.text.paragraphs` : text for "Paragraphs"
* `wordcounter.text.char` : text for "Char"
* `wordcounter.text.chars` : text for "Chars"
* `wordcounter.text.reading` : text for "reading time"
* `wordcounter.text.delimiter` : text for ", "
* `wordcounter.text.word_delimiter` : text for spacing between items " "

## Known Issues

In multi-selection mode, paragraphs are not well counted => #21

## Contributors

* Etienne Faisant
* Jonathan T L Lee
* Artboomy

