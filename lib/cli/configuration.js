const config = require('../config');

module.exports = function(self, callback){

  var currentSettings = config.server.get()

  var questions = [
    {
      type: 'input',
      name: 'email',
      message: "Enter registration e-mail: ",
      validate: function(value) {
        if (value) {
          if (value.indexOf('@') < 0 ){
            return false
          } else {
            return true
          }
        } else {
          return false
        }
      },
      default: function(){
        if (currentSettings.email){
          return currentSettings.email
        } else {
          return ''
        }
      }
    },
    {
      type: 'input',
      name: 'name',
      message: "Enter RIG Name: ",
      validate: function(value) {
        if (value) {
          return true
        } else {
          return false
        }
      },
      default: function() {
        if (currentSettings.name){
          return currentSettings.name
        } else {
          return ''
        }
      }
    },
    {
      type: 'input',
      name: 'group',
      message: "Enter Group: ",
      validate: function(value) {
        if (value) {
          return true
        } else {
          return false
        }
      },
      default: function() {
        if (currentSettings.group){
          return currentSettings.group
        } else {
          return ''
        }
      }
    }
  ]


  self.prompt(questions, function(result){
    callback(result)
  });

}
