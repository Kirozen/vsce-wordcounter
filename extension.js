'use strict';
var vscode  = require('vscode');
var command = require('./counter');

function activate(context) {

    var wordCounter = new command.WordCounter();
    var controller  = new command.WordCounterController(wordCounter);

    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;