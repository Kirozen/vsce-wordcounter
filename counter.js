"use strict";
var vscode = require('vscode');

function WordCounter() {

    this.update = function () {
        if(!this.statusBarItem) {
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }

        var editor = vscode.window.activeTextEditor;
        if(!editor) {
            this.statusBarItem.hide();
            return;
        }

        var doc = editor.document;

        this.statusBarItem.text = this.count(doc);
        this.statusBarItem.show();
    };

    this.hide = function() {
        this.statusBarItem.hide();
    };

    this.count = function(doc) {
        var content = doc.getText();
        // From WordCount example
        var wcontent = content.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        var words = 0;
        if(wcontent !== "") {
            words = wcontent.split(' ').length;
        }
        var chars = content.length;
        var lines = doc.lineCount;

        var words_text = ' Words';
        if(words < 2) {
            words_text = ' Word';
        }

        var chars_text = ' Chars';
        if(chars < 2) {
            chars_text = ' Char';
        }

        var lines_text = ' Lines';
        if(lines < 2) {
            lines_text = ' Line';
        }

        return words + words_text + ', ' + chars + chars_text + ', ' + lines + lines_text;
    };

    this.dispose = function() {
        this.statusBarItem.dispose();
    };
};
exports.WordCounter = WordCounter;

function WordCounterController(wc) {
    this.wordCounter = wc;
    this.enabled = true;

    var subscriptions = [];

    vscode.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
    vscode.window.onDidChangeActiveTextEditor(this._onEventWhenChanged, this, subscriptions);

    this.reloadConfig = function() {
        var configuration = vscode.workspace.getConfiguration("wordcounter");
        if(configuration) {
            this.enabled = configuration.get("enable");
        }
    };
    this.reloadConfig();
    if(this.enabled && vscode.window.activeTextEditor) {
        this.wordCounter.update();
    }

    this.disposable = vscode.Disposable.from.apply(vscode.Disposable, subscriptions);

    this.dispose = function () {
        this.disposable.dispose();
    };
};

WordCounterController.prototype._onEvent = function(event) {
    if(this.enabled) {
        this.wordCounter.update();
    }
};

WordCounterController.prototype._onEventWhenChanged = function(event) {
    this.reloadConfig();
    if(this.enabled) {
        this.wordCounter.update();
    } else {
        this.wordCounter.hide();
    }
};

exports.WordCounterController = WordCounterController;