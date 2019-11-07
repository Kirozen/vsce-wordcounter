import * as vscode from 'vscode';

import { WordCounter, WordCounterController } from './wordCounter';

export function activate(context: vscode.ExtensionContext) {
  const wordCounter = new WordCounter();
  const controller = new WordCounterController(wordCounter);

  context.subscriptions.push(controller);
  context.subscriptions.push(wordCounter);
}

// this method is called when your extension is deactivated
export function deactivate() { }
