"use strict"

const jsonfile = require('jsonfile');
const app = require('../')
const path = require('path');


const files = {
  server: path.join(app.PROJECT_DIR, "config", "config.json"),
  programs: path.join(app.PROJECT_DIR, "config", "programs.json"),
  defaults: path.join(app.PROJECT_DIR, "config", "defaults.json"),
}

var server = {}
var programs = {}
var defaults = {}

var read_json = function(file_name){
  try{
    return jsonfile.readFileSync(file_name)
  }catch(e){
    return {}
  }
}

var write_json = function(file_name, obj){
  try{
    jsonfile.writeFileSync(file_name, obj, {spaces: 2})
    return null
  }catch(e){
    return e
  }
}

/**
  host settings
*/
server.get = function(){
  return read_json(files.server)
}

server.set = function(obj){
  return write_json(files.server, obj)
}


/**
  mining software
*/
programs.get = function(){
  return read_json(files.programs)
}

programs.set = function(obj){
  return write_json(files.programs, obj)
}


/**
  Defaults
*/
defaults.get = function(){
  return read_json(files.defaults)
}

module.exports = {
  server,
  programs,
  defaults
}
