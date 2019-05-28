import { WordCounter, WordCounterController } from './wordCounter.js';

function activate(context) {
  const wordCounter = new WordCounter();
  const controller = new WordCounterController(wordCounter);

  context.subscriptions.push(controller);
  context.subscriptions.push(wordCounter);
}

function deactivate() {

}

const _activate = activate;
export {
  _activate as activate
};
const _deactivate = deactivate;
export {
  _deactivate as deactivate
};
