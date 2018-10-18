const channels = require("./files/channels.json");

function canMessage(message, isCommand = false, hasPermission = false) {
  let _canMessage = false;
  channels.forEach(channel => {
    const rules = channel.rules;
    if (message.channel.id === channel.id) {
      if (rules.includes("noCommands", 0) && isCommand) {
        console.log(channel);
        message.delete();
        _canMessage = false;
        sendWarning(message, "*commands* are not allowed in");
        return;
      } 
      if (rules.includes("commandsOnly", 0) && isCommand === false) {
        console.log(channel);
        message.delete();
        _canMessage = false;
        sendWarning(message, "you can only send *commands* in");
        return;
      }
      if (rules.includes("noRules", 0)) {
        console.log(channel);
        _canMessage = true;
        return;
      }
      _canMessage = true;
    }
  });

  return hasPermission ? true : _canMessage;
}

function sendWarning(message, response) {
  message.author.send(
    `Go me nasai!, ${response} ***#${message.channel.name}*** channel.`
  );
}

module.exports = canMessage;
