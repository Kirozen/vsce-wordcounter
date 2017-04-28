"use strict";
var vscode = require('vscode');

function WordCounter() {

    this.count_words = true;
    this.count_chars = true;
    this.count_lines = true;
    this.readtime = true;
    this.wpm = 200;

    this.update = function () {
        if (!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }

        var doc = editor.document;

        this.statusBarItem.text = this.count(doc, editor.selection);
        this.statusBarItem.show();
    };

    this.hide = function () {
        this.statusBarItem.hide();
    };

    this.count = function (doc, selection) {
        var content = doc.getText();
        if (!selection.isEmpty) {
            content = doc.getText(selection.with());
        }
        // From WordCount example
        var wcontent = content.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        var words = 0;
        if (wcontent !== "" && (this.count_words || this.readtime)) {
            words = wcontent.split(' ').length;
        }

        var toDisplay = [];

        if (this.count_words) {
            var words_text = ' Words';
            if (words < 2) {
                words_text = ' Word';
            }

            toDisplay.push(words + words_text);
        }

        if (this.count_chars) {
            var chars = content.length;
            var chars_text = ' Chars';
            if (chars < 2) {
                chars_text = ' Char';
            }

            toDisplay.push(chars + chars_text);
        }

        if (this.count_lines) {
            var lines = doc.lineCount;
            if (!selection.isEmpty) {
                lines = content.split("\n").length;
            }
            var lines_text = ' Lines';
            if (lines < 2) {
                lines_text = ' Line';
            }

            toDisplay.push(lines + lines_text);
        }

        if (this.readtime) {
            var m = Math.round(words / this.wpm);
            var s = Math.round(words % this.wpm / (this.wpm / 60));

            toDisplay.push("~" + m + "m " + s + "s reading time");
        }
        return toDisplay.join(', ');
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

    vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this._onEventWhenChanged, this, subscriptions);
    vscode.workspace.onDidChangeConfiguration(this._onEventWhenConfChanged, this, subscriptions);

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

WordCounterController.prototype._onEvent = function (event) {
    if (this.enabled) {
        this.wordCounter.update();
    }
};

WordCounterController.prototype._onEventWhenChanged = function (event) {
    this.reloadConfig();
    if (this.enabled) {
        this.wordCounter.update();
    } else {
        this.wordCounter.hide();
    }
};

WordCounterController.prototype._onEventWhenConfChanged = function (event) {
    this.reloadConfig();
    if (this.enabled) {
        this.wordCounter.update();
    } else {
        this.wordCounter.hide();
    }
}

exports.WordCounterController = WordCounterController;