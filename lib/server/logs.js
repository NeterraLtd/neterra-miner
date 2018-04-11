"use strict"
const pm2 = require('pm2')
const util = require('util')
const EventEmitter = require('events').EventEmitter

const heartbeats = require('heartbeats');

const programs = require('../programs/api');
const config = require('../config');

const Logs = function(miner){

  var self = this
  var heart = heartbeats.createHeart(1000);


  pm2.connect(function(){
    pm2.launchBus(function(err, bus) {
      bus.on('log:*', function(type, packet) {
        if (packet.process.name.indexOf('neterra_miner_')>=0){
          var data = {
            id: packet.process.pm_id,
            name: packet.process.name,
            time: packet.at,
            data: packet.data
          }
          //log
          self.emit('miner:log', data)
        }
      });

      // events_log
      bus.on('process:event', function(proc_event){
        if (proc_event.process.name.search('neterra_miner_') >= 0){
          var type, msg, name
          name = proc_event.process.name.replace('neterra_miner_', '')
          switch (proc_event.event) {
            // case 'exit':
            //   type = 'danger'
            //
            //   break;
            case 'stop':
              type = 'danger'
              msg = `Stop ${name}`
              break;
            case 'restart':
              type = 'warning'
              msg = `Restart ${name}`
              break;
            case 'online':
              type = 'success'
              msg = `Start ${name}`
              break;
            default:
          }

          if (type){
            self.emit('miner:event', {
              type: type,
              msg: msg,
              time: new Date(proc_event.at).getTime()
            })
          }
        }
      })
    });
  })

  //status
  heart.createEvent(10, function(count, last){
    miner.processes.list(function(err, result){
      if (err) return self.emit('miner:error', err);
      result.forEach(function(proc){
        if (proc.status.status === 'online'){
          programs[proc.program.name].stats(function(err, status){
            if (err) return self.emit('miner:error', err);
            return self.emit('miner:stats', status);
          })
        }
      })
    })
  })

}

util.inherits(Logs, EventEmitter);
module.exports = Logs;
