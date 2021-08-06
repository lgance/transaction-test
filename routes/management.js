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
    const { object_storage_link } = req.query;
    let _response = {};

    const getRootPath = await FileTracker.getRootPath();
    const storageFileName = object_storage_link.length !==0 ?
          object_storage_link.split('/')[object_storage_link.split('/').length-1] :
          false;

    console.log(req.ip);

    const objectStoragePath = getRootPath + '/ObjectStorage';
    let objectStorageDownloadActionResult  = await FileTracker.fileDownload(objectStoragePath,object_storage_link);
    let objectStorageDownloadFileExistResult ;
    let objectStorageDownloadFileCleanUpResult ;

    let responseMessage = '';
    let testResult = 'fail';
    let desc =`${object_storage_link} 로 부터 NCP 내부 VM 으로 파일 다운로드 `;


    if(objectStorageDownloadActionResult){
	objectStorageDownloadFileExistResult = await FileTracker.existFile(objectStoragePath,storageFileName);
	objectStorageDownloadFileCleanUpResult = await FileTracker.cleanFolder(objectStoragePath);
    } 
    if(objectStorageDownloadActionResult && objectStorageDownloadFileExistResult ){
      testResult = 'pass';
    }
    	
    _response.desc = desc + `[결과] :  ${testResult}`;
    _response.result = testResult;
    _response.responseMessage = responseMessage;
  
    res.send(_response);
  } catch (error) {
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
router.get('/system_security_checker',(req,res,next)=>{
  try {
    const { platform } = req.query;

    
	    

    res.send('systemsecuritychecker');
  } catch (error) {
    next(error);
  }
});



module.exports = router;
