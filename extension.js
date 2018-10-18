const { WordCounter, WordCounterController } = require('./wordCounter.js')

function activate (context) {
  const wordCounter = new WordCounter()
  const controller = new WordCounterController(wordCounter)

  context.subscriptions.push(controller)
  context.subscriptions.push(wordCounter)
}

function deactivate () {

}

exports.activate = activate
exports.deactivate = deactivate
