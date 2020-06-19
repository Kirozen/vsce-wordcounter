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

* `wordcounter.enable`: enable/disable this extension (*true/false)
* `wordcounter.simple_wordcount`: enable/disable simple word count algorithm (*true/false)
* `wordcounter.include_eol_chars`: enable/disable eol chars in character count (*true/false)
* `wordcounter.languages`: enable this extension for these specific languages, or all if null (default=null, list of supported languages)
* `wordcounter.wpm`: words per minute (default=200)
* `wordcounter.side.left`: control order on the left side of the status bar
* `wordcounter.side.right`: control order on the right side of the status bar
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

## Contributors

* Kirozen
* Jonathan T L Lee
* Artboomy
* FuriouZz
