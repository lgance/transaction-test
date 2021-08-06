const path = require('path');
const { spawn , exec } = require('child_process');
const moment = require('moment');


/**
 * Window not supported
 *            window support later
 */

function Tracker(){}

Tracker.getRootPath = function(){
  return new Promise((resolve,reject)=>{
    try {
      let rootPath = __dirname;
      resolve(rootPath);
    } catch (error) {
      console.error('[Error] get File Root Path ');
      this.log(error); 
    }
  })
}

Tracker.fileDownload = function(path,url){
  return new Promise(async(resolve,reject)=>{
    try {

      let _command = `wget ${url}`;
      // let exec = exec(_command);
      resolve(true);

    } catch (error) {
      console.error('[Error] File Download ');
      this.log(error);
    }

  })
}

Tracker.log = function(errorMessage){
  /* Log Template */
  /*
    [Today] 
    {errorMessage}

  */

    console.log(errorMessage);
}

module.exports = Tracker;