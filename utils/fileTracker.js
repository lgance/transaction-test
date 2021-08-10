const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { readdir,unlink } = require('fs/promises');
const { spawn } = require('child_process');
const moment = require('moment');


/**
 * Window not supported
 *            window support later
 */

function Tracker(){}

Tracker.getRootPath = function(){
  return new Promise((resolve,reject)=>{
    try {
      let rootPath = path.resolve(__dirname,'../NCPService');
      resolve(rootPath);
    } catch (error) {
      console.error('[Error] get File Root Path ');
      this.log(error); 
    }
  })
}

Tracker.fileDownload = function(path,url,timeout){
  return new Promise(async(resolve,reject)=>{
    try {
      /* Delete Error Defence   */
      const files = await readdir(path);
      if(files.length>=10){
	throw new Error('File Delete ERROR [ Check FileTracker clean Folder Function ] FILE LIMIT is 10 ');
      }
     
      let _timeout = timeout || 3000;
     
      let _command = `wget ${url}`;
      let _execOptions= {
	cwd:path	
      }
      // exec 성공 실패 상태 
      let execResult = false;


      /* exec가 만약에 성공하지 못했을 경우 계속 TCP 리다이렉트로인한
         계속 요청으로 인해서 Agent는 Timeout을 맞게 됩니다. 하지만 오류가
         Agent의 ReFused 오류가 나기때문에 정확한 오류전달을 위해
         File Tracker에서 적정시간내에 파일을 다운하지 못할 경우 ( timeout 시간 )
         해당 task queue에서 resolve로 나올수 있도록 합니다.*/

        setTimeout(()=>{
                console.log('FileDownload Failed Check Worker');
                console.log(execResult);
                if(!execResult){
                  console.log(`File Download Timeout ${_timeout}ms`);
                  resolve(false);
		  resolve({
		   result:false
		  });
                }
                else{
		  console.log('File Download Safe SUCCESS');
     		  resolve({
	   	   result:true,
 		   stderr:stderr
	          });
                }
        },_timeout);



      let { stdout, stderr }  = await exec(_command,_execOptions);
       execResult = true;
       console.log(`stdout: ${stdout}   ${stdout.length}`);
       console.error(`stderr: ${stderr}`);




    } catch (error) {
      this.log(error,'[ERROR] FIle Download');
      
      if(condition==="false"){
	console.log('ERROR PROPERTY ADDED');
	
	let errorObj = {};
	errorObj.originError = error;
	errorObj.condition = condition;
	errorObj.objectlink = url;
	
	reject(errorObj);
      } 
      else{
        reject(error);
      }
    }
  })
}


Tracker.existFile = function(path,filename){
  return new Promise(async(resolve,reject)=>{
   try{
	const files = await readdir(path);
   	let existFile = false;
	console.log(`[ EXIST CHECK File Name ] : ${filename} `);
	console.log(files);			
	
	for (const file of files){
	   if(filename===file){
	     existFile = true;
	     console.log(`[ EXIST FILE CHECK !! ] ${file}`);
  	   }
 	}
	resolve(existFile);
   }
   catch(error){
      this.log(error,'[Error] Exist File Error '); 
      reject(error);	
   }
  });
}


/*
 * warning : this function folder rm -rf * 
 * 	     use with caution
 *
 */

Tracker.cleanFolder = function(path){
 return new Promise(async(resolve,reject)=>{
  try{
	let exceptionFile = '.gitkeep';     
	let _command = 'rm -rf *';
 	let _execOptions = {
		cwd:path
  	}
	let isValidate = await this.pathValidation(path);


	/* Validation true and Clean Folder Action */
	if(isValidate){
	  console.log(`[ FOLDER CLEAN UP ${path} ] `);
	  let { stdout, stderr } = await exec(_command,_execOptions);

	    console.log(`stdout: ${stdout}`);
	    console.error(`stderr: ${stderr}`); 
          console.log(`[ FOLDER CLEAN UP ${path} Complete ] `);
	    resolve(true);
	}
	/* Validation false and Cleaen Folder Action Reject */
	else {
	  throw new Error(`Clean Folder ERROR is clean path is System Path ${path}`);
	}
  }
  catch(error){
	this.log(error,"[ERROR] cleanFolder ");
        reject(error);
  }
 });
}

Tracker.pathValidation = function(path){
  return new Promise(async(resolve,reject)=>{
    try{
	console.log('Path Validation');
	let systemPath = ['bin','boot','dev','etc','lib','lib64','opt','proc',
        'root','run','sbin','srv','sys','tmp','usr','var'];

	let checkPath = path.split('/').slice(0,3);

	let isValidate = true;
	
	console.log(checkPath);
	console.log(path);

   	await checkPath.reduce(async(prev,curr,index)=>{
      	   let nextItem = await prev;
	   let isSystemPath =  systemPath.includes(curr);
	   if(isSystemPath) isValidate = false;
	   return nextItem;
        },Promise.resolve()); 
	
	resolve(isValidate);

    }
    catch(error){
	this.log(error,'[ERROR] pathValidation');
	reject(error);
    }
  });
}

Tracker.log = function(errorObject,errorMessage){
  /* Log Template */
  /*
    [Today] 
    {errorMessage}

  */
    console.log(errorMessage);
    console.log(errorObject);
}

module.exports = Tracker;
