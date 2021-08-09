const express = require('express');
const router = express.Router();
const os = require('os');

const FileTracker = require('../utils/fileTracker');


const port = process.env.port;
const timeOut = process.env.timeout;


// management Router
router.get('/',(req,res,next)=>{
  try {
    

    res.send('management Router');
  } catch (error) {
    next(error);
  }
});


// Object Storage 
router.get('/object_storage',async(req,res,next)=>{
  try {
    const { object_storage_link,condition } = req.query;
    let _response = {};

    const getRootPath = await FileTracker.getRootPath();
    const storageFileName = object_storage_link.length !==0 ?
          object_storage_link.split('/')[object_storage_link.split('/').length-1] :
          false;

    console.log(req.ip);

    const objectStoragePath = getRootPath + '/ObjectStorage';
    let objectStorageDownloadActionResult  = await FileTracker.fileDownload(objectStoragePath,object_storage_link,condition);
    let objectStorageDownloadFileExistResult ;
    let objectStorageDownloadFileCleanUpResult ;

    let testResult = 'fail';
    let desc =`${object_storage_link} 로 부터 NCP 내부 VM 으로 파일 다운로드 `;


    if(objectStorageDownloadActionResult.result===true){
	objectStorageDownloadFileExistResult = await FileTracker.existFile(objectStoragePath,storageFileName);
	objectStorageDownloadFileCleanUpResult = await FileTracker.cleanFolder(objectStoragePath);
    } 
    if(objectStorageDownloadActionResult && objectStorageDownloadFileExistResult ){
      testResult = 'pass';
    }
    	
    _response.desc = desc + `[결과] :  ${testResult}`;
    _response.result = testResult;
    _response.responseMessage = objectStorageDownloadActionResult.stderr; 
  
    res.send(_response);
  } catch (error) {
     if(error.condition==="false"){
      console.log(error);
      res.send({
           desc:`${error.objectlink} 로 부터 NCP 내부 VM 으로 파일 다운로드 불가 테스트 ( 403 Forbidden ) [결과] : Pass`,
           result:"pass",
           responseMessage : error.originError.stderr
        });
     }
     next(error)
  }
});

// Source Commit

router.get('/source_commit',(req,res,next)=>{
  try {
    
    res.send('sourceocmmit');
  } catch (error) {
    next(error);
  }
});


// NAS
router.get('/nas',(req,res,next)=>{
  try {
    
    res.send('nas')
  } catch (error) {
    next(error);
  }
});


// System Security Checker
router.get('/system_security_checker',async(req,res,next)=>{
  try {
    const { platform } = req.query;

    console.log(platform);    
	    
    let govSSC = 'http://pub-ossc.ncloud.com:10080/download/ncp_secuagent.tar.gz';
    let pubSSC = 'http://ossc.ncloud.com:10080/download/ncp_secuagent.tar.gz';
    let finSSC = 'FIN'; 

    let testSSC= '';
    if(typeof platform ==='undefined'){
	res.send('platform is not undefined');
	return;
    }
    else if(platform.toLowerCase()==='gov'){ testSSC = govSSC; }
    else if(platform.toLowerCase()==='pub'){ testSSC = pubSSC; }
    else if(platform.toLowerCase()==='fin'){ testSSC = finSSC; }
    else{
	res.send('not includes platform '+ platform);	
	return;
    }

   
    const getRootPath = await FileTracker.getRootPath();
    /* Agent Name Filtering */
    const sscAgentName = testSSC.split('/')[testSSC.split('/').length-1];
    
    /* Agent Download Path */
    const systemSecurityPath = getRootPath + '/SystemSecurityChecker';

    /* Agent Down load */
    let sscDownloadActionResult = await FileTracker.fileDownload(systemSecurityPath,testSSC);
		
    /* Agent File Exist Check */
    let sscDownloadFileExistResult;

    /* Agent File Clean Up */
    let sscDownloadFileCleanUpResult;

    if(sscDownloadActionResult){
	sscDownloadFileExistResult = await FileTracker.existFile(systemSecurityPath,sscAgentName);
	sscDownloadFileCleanUpResult = await FileTracker.cleanFolder(systemSecurityPath);
    }
  
    /* Response Data  */
    let _response = {};
    let responseMessage = '';
    let testResult = 'fail';
    let desc = `${platform} 환경에서 System Security Checker Down 확인 `;
    
    if(sscDownloadActionResult && sscDownloadFileExistResult ){
      testResult="pass";
    }
    _response.desc = desc + `[결과] : ${testResult}`;
    _response.result = testResult;
    _response.responseMessage = responseMessage;

    res.send(_response);
	 
  } catch (error) {
    next(error);
  }
});

module.exports = router;
