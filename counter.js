"use strict";
var vscode = require('vscode');

Array.prototype.unique = function () {
    return this.filter(function (value, index, self) {
        return self.indexOf(value) === index;
    });
}

function WordCounter() {

    this.count_words = true;
    this.count_chars = true;
    this.count_lines = true;
    this.readtime = true;
    this.wpm = 200;

    this.update = function (fromSelection) {
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }

        var doc = editor.document;

        if (fromSelection) {
            if (editor.selections.length == 1) {
                if (!editor.selection.isEmpty) {
                    this.statusBarItem.text = this.countSelectedSimple(doc, editor.selection);
                } else {
                    this.statusBarItem.text = this.countAll(doc);
                }
            } else {
                this.statusBarItem.text = this.countSelectedMultiple(doc, editor.selections);
            }
        } else {
            this.statusBarItem.text = this.countAll(doc);
        }
        this.statusBarItem.show();
    };


    this.hide = function () {
        this.statusBarItem.hide();
    };

    this.computeResult = function (doc, content, hasSelectedText) {
        var wcontent = content.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        var words = 0;
        if (wcontent !== "" && (this.count_words || this.readtime)) {
            words = wcontent.split(' ').length;
        }

        var toDisplay = [];

        if (this.count_words) {
            var words_text = ' Words';
            if (words === 1) {
                words_text = ' Word';
            }

            toDisplay.push(words + words_text);
        }

        if (this.count_chars) {
            var chars = content.length;
            var chars_text = ' Chars';
            if (chars === 1) {
                chars_text = ' Char';
            }

            toDisplay.push(chars + chars_text);
        }

        if (this.count_lines) {
            var lines = doc.lineCount;
            if (hasSelectedText) {
                lines = content.split("\n").length;
            }
            var lines_text = ' Lines';
            if (lines === 1) {
                lines_text = ' Line';
            }

            toDisplay.push(lines + lines_text);
        }

        if (this.readtime) {
            const div = words / this.wpm;
            const m = Math.floor(div);
            const s = Math.round(60 * (div - m));

            toDisplay.push("~" + m + "m " + s + "s reading time");
        }
        return toDisplay.join(', ');
    };

    this.countSelectedSimple = function (doc, selection) {
        var content = doc.getText(selection.with());
        return this.computeResult(doc, content, true);
    };

    this.computeResultMulti = function (doc, selections) {
        var words = 0;
        var length = 0;
        var lines = [];
        selections.forEach(selection => {
            var content = doc.getText(selection.with());
            var wcontent = content.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            if (wcontent !== "" && (this.count_words || this.readtime)) {
                words += wcontent.split(' ').length;
            }

            if (this.count_chars) {
                length += content.length;
            }

            if (this.count_lines) {
                if (selection.isSingleLine) {
                    lines.push(selection.start.line);
                } else {
                    var start = selection.start.line;
                    var end = selection.end.line;
                    for (var i = start; i <= end; i++) {
                        lines.push(i);
                    }
                }
            }
        });


        var toDisplay = [];

        if (this.count_words) {
            var words_text = ' Words';
            if (words === 1) {
                words_text = ' Word';
            }

            toDisplay.push(words + words_text);
        }

        if (this.count_chars) {
            var chars_text = ' Chars';
            if (length === 1) {
                chars_text = ' Char';
            }

            toDisplay.push(length + chars_text);
        }

        if (this.count_lines) {
            lines = lines.unique();
            var lines_text = ' Lines';
            if (lines.length === 1) {
                lines_text = ' Line';
            }

            toDisplay.push(lines.length + lines_text);
        }

        if (this.readtime) {
            const div = words / this.wpm;
            const m = Math.floor(div);
            const s = Math.round(60 * (div - m));

            toDisplay.push("~" + m + "m " + s + "s reading time");
        }
        return toDisplay.join(', ');
    };

    this.countSelectedMultiple = function (doc, selections) {
        return this.computeResultMulti(doc, selections);
    };

    this.countAll = function (doc) {
        return this.computeResult(doc, doc.getText(), false);
    };

    this.dispose = function () {
        this.statusBarItem.dispose();
    };
};
exports.WordCounter = WordCounter;

function WordCounterController(wc) {
    this.wordCounter = wc;
    this.enabled = true;
    this.count_words = true;
    this.count_chars = true;
    this.count_lines = true;
    this.readtime = true;
    this.wpm = 200;

    var subscriptions = [];

    vscode.window.onDidChangeTextEditorSelection(this._onEventTextEditorSelection, this, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this._onEventWhenChanged, this, subscriptions);
    vscode.workspace.onDidChangeConfiguration(this._onEventWhenConfChanged, this, subscriptions);
    vscode.workspace.onDidChangeTextDocument(this._onEventWhenChanged, this, subscriptions);

    this.reloadConfig = function () {
        var configuration = vscode.workspace.getConfiguration("wordcounter");
        if (configuration) {
            this.enabled = configuration.get("enable", true);
            this.count_words = configuration.get("count_words", true);
            this.count_chars = configuration.get("count_chars", true);
            this.count_lines = configuration.get("count_lines", true);
            this.readtime = configuration.get("readtime", true);
            this.wpm = configuration.get("wpm", 200);
            // Avoid 0 and negative values
            if (this.wpm < 1) {
                this.wpm = 200;
            }
        }
        if (!this.count_words && !this.count_chars && !this.count_lines && !this.readtime) {
            this.enabled = false;
        }
        this.wordCounter.count_words = this.count_words;
        this.wordCounter.count_chars = this.count_chars;
        this.wordCounter.count_lines = this.count_lines;
        this.wordCounter.readtime = this.readtime;
        this.wordCounter.wpm = this.wpm;
    };
    this.reloadConfig();

    if (this.enabled && vscode.window.activeTextEditor) {
        this.wordCounter.update();
    }

    this.disposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions);

    this.dispose = function () {
        this.disposable.dispose();
    };
};

WordCounterController.prototype._onEventTextEditorSelection = function (event) {
    if (this.enabled) {
        this.wordCounter.update(true);
    } else {
        this.wordCounter.hide();
    }
};

WordCounterController.prototype._onEventWhenChanged = function (event) {
    if (this.enabled) {
        this.wordCounter.update(false);
    } else {
        this.wordCounter.hide();
    }
};

WordCounterController.prototype._onEventWhenConfChanged = function (event) {
    this.reloadConfig();
    if (this.enabled) {
        this.wordCounter.update(false);
    } else {
        this.wordCounter.hide();
    }
}


exports.WordCounterController = WordCounterController;
