"use strict"

const spawn = require('child_process').spawn
const exec = require('child_process').exec
const path = require('path');
const fs = require('fs');

var params = JSON.parse(process.argv[2])
var program = params.execute
var args = params.params
var env = params.variables

var options = { stdio: 'inherit' };

if (!program){
  console.log('Program arg missing!');
  throw new Error('Program arg missing!')
}

fs.access(program, fs.constants.R_OK | fs.constants.W_OK, function(err){
  if (err) {
    throw new Error('Program not found!');
  }

  var mining_process = spawn(program, args, options)

  mining_process.on('close', function(code){
    process.exitCode = code
    process.exit(code)
  })

  mining_process.on('exit', function(code){
    process.exitCode = code
    process.exit(code)
  })

  process.on('message', function(pmsg){
    console.log('msg:', pmsg);
  })

});
