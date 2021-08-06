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
    const getRootPath = await FileTracker.getRootPath();
    console.log(req.ip);


    let tempURL = 'https://kr.object.gov-ncloudstorage.com/transaction-test-object/transaction_excel_img.png';
    console.log(`${getRootPath} Root Path `);
    console.log(object_storage_link);


    const objectStoragePath = getRootPath + '/ObjectStorage';

    await FileTracker.fileDownload(objectStoragePath,object_storage_link);

    res.send('objectstorage');
  } catch (error) {
    next(error);
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
    

    res.send('systemsecuritychecker');
  } catch (error) {
    next(error);
  }
});



module.exports = router;
