const chalk = require('chalk');
const figlet = require('figlet');

var get_logo = function(){
  return figlet.textSync('Neterra Miner')
}

module.exports = {
  chalk,
  get_logo
}
