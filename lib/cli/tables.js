const Table = require('cli-table2');
const Duration = require('duration')
const chalk = require('chalk');
const moment = require('moment');



const profit2table = function(coins, options){
  var coins = coins || []
  var options = options || {}

  if (!coins.forEach){
      return coins
  }

  var head = [
    chalk.blue.bold("Coin"),
    chalk.blue.bold("Day"),
    chalk.blue.bold("Week"),
    chalk.blue.bold("Month"),
    chalk.blue.bold("Day in USD"),
    chalk.blue.bold("Week in USD"),
    chalk.blue.bold("Month in USD"),
  ]

  var table = new Table({ head: head});
  coins.forEach(function(coin){
    var result = [ coin.name, coin.profit.day.toFixed(6), coin.profit.week.toFixed(6), coin.profit.month.toFixed(6), coin.profit_usd.day.toFixed(2), coin.profit_usd.week.toFixed(2), coin.profit_usd.month.toFixed(2) ]
    table.push(result)
  })
  return table
}

const configs2table = function(configs, options){
  var configs = configs || []
  var options = options || {}

  var head = [
    chalk.blue.bold("Name"),
    chalk.blue.bold("Coin"),
    chalk.blue.bold("Program")
  ]

  var table = new Table({ head: head});

  if (!configs.forEach){
      return table
  }

  configs.forEach(function(config){
    var result = [ config.name, config.coin.name, config.program.name]
    table.push(result)
  })
  return table
}


const processes2table = function(processes, options){

  var processes = processes || []
  var options = options || {}

  var head = [
    chalk.blue.bold("Coin"),
    chalk.blue.bold("Name"),
    chalk.blue.bold("Status"),
    chalk.blue.bold("Restarts"),
    chalk.blue.bold("Uptime")
  ]

  var table = new Table({ head: head});

  if (!processes.forEach){
      return table
  }

  processes.forEach(function(proc){
    var coin_tag = proc.coin_tag
    var name = chalk.blue(proc.name)
    var status = proc.status.status || "offline"
    var restarts = proc.status.restarts || "0"
    var uptime = proc.status.uptime || "0"

    if (status == "online"){
      uptime = new Duration(new Date(parseInt(uptime)), new Date())
      uptime = uptime.toString(1,1)
    }else{
      uptime = "0"
    }

    if (status == "online"){
      status = chalk.green(status)
    }else{
      status = chalk.red(status)
    }

    var result = [ coin_tag, name, status, restarts, uptime ]
    table.push(result)
  })

  return table
}

module.exports = {
  processes2table,
  configs2table,
  profit2table
}
