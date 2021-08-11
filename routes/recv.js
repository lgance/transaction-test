const express = require('express');
const router = express.Router();
const os = require('os');
const path = require('path');
const fs = require('fs');

const moment = require('moment');
//const Tracker = require('../utils/tcpTracker');
const UDPTracker = require('../utils/udpTracker');
const filePath = path.resolve(__dirname,'../log');

// recv Router 
router.get('/',(req,res,next)=>{
    try {

    const ip = getIP(req);

    const{srcIP,dstIP,checkIP} = req.query;
	
    if(existParam(checkIP)){
	console.log('[Check IP Exist ] Success');
       if(validationIP(checkIP) && checkIP===ip){
             console.log(`[Check IP ] Check Success [${checkIP}]`);
	     res.send('success');
       }
	/* expected ip fail or not IP Address   */   
       else{
	const checklog = `[Check IP ] IP Validation Error [${checkIP}] expected IP {${ip}]`;
	console.log(checklog);
	res.status(400).send(checklog);
       }
    }
    else{
       console.log('[NOT Exist Check IP ] Success');
       res.send('success');
   }
  } catch (error) {
        next(error);
    }
});
// 패킷 전달시 파일 생성 
router.get('/nacl',(req,res,next)=>{
	try{
	  const message="this Router is NACL Test after create File";
	  console.log(message);

	  createFile();
	  
	  setTimeout(()=>{
		  deleteFile();
	  },10000);
	  res.send(message);
	}
	catch( error ) {
	  next(error);	
	}
});

// 생성된 파일 체크 
router.get('/check',(req,res,next)=>{
	try{
		const existFile =isFile();
		let _res = {}
		console.log('Check Router ');
		if(!!existFile){
				deleteFile();
				_res.result="pass";
				res.send(_res);
		}
		else{
			(function (closure_res){
						setTimeout(() => {
						const message ="this Router is NACL Create File Check ";	
						const existFile = isFile();
						deleteFile();
						if(!!existFile){
							closure_res.result="pass";
							res.send(closure_res);
						}
						else {
							closure_res.result="fail";
							res.send(closure_res);
						}	
					}, 5000);
				}
			)(_res);
		}
	}
	catch( error ){
	  next(error);
	}
});


// udp Status READY
router.get('/udp/ready',async(req,res,next)=>{
  try{
    /* RUNNING UDP CHECK */
    let udpState = await UDPTracker.getState('udp');
    console.log('UDP STATE');
    console.log(udpState);
    if(!!udpState){
	console.log('UDP is get PACKET');
	res.send('RUNNING');
    } 
    else{
    	/* UDP TCPDump Ready */
	console.log('[STATUS] UDP READY ');
	let udpSubProcess =  await UDPTracker.udpReady();
	console.log('PID');
	let udpState = udpSubProcess === true ? 'READY'  : 'ERROR';
	res.send(udpState);	
    }
  }
  catch(err){
    console.log(err);
	//    res.send(err);		
     res.send('ERROR');

  }
});

/* New UDP Packet Check  */
router.get('/udp/packet',async(req,res,next)=>{
  try{
    console.log('UDP Packet Check ');
    let desc = 'UDP Packet CHECK ';
    let udpObj = {};
  
    let udpClose = await UDPTracker.udpBufferClose();
    	
    if(!udpClose) desc = 'UDP Process is not Exist' ;
    let udpState = UDPTracker.getState('udp');
    udpObj.state = udpState;
    udpObj.desc = desc;
    
    res.send(udpObj);
  }
  catch(err){
    console.log(err);  
    res.send(err);
  }
});

/* udp Packet Status Legacy */
router.get('/udp',async(req,res,next)=>{
	try{
    console.log('udp recvRouter');
    const { srcIP ,dstIP }  = req.query;
    const packetString = await UDPTracker.getPacket();
    console.log(packetString);

    let udpObj = {};
    let udpState = UDPTracker.getState('udp');
    udpObj.state = udpState;
    udpObj.desc = 'UDP Check ';

    res.send(udpObj);
	}
	catch(err){
		console.log(err);
		res.send(err);
	}
});


const getIP = (req)=>{
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") { ip = ip.substr(7);}
  return ip;
}


const validationIP = (checkIP)=>{
    const filter = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    
   if(checkIP.match(filter)){
     return true;
   }
	return false;
}
const existParam = (param)=>{
  if(param ==="undefined" || param===undefined){return false; }
  else if(typeof param==="undefined" && typeof param===undefined){ return false;    }
  else if(param===null){return false;}
  else{ return true;  }
}

const isFile = ()=>{
	const files = fs.readdirSync(filePath);
	const whitelist = ['.gitkeep','test.sh'];

	console.log('/********isFile***********/')
	return files.filter((item,index)=>{
		if(!whitelist.includes(item)){
				console.log(item);
				return item;
		}
	}).length === 1 ? true : false;
 }

 const deleteFile = ()=>{
	const files = fs.readdirSync(filePath);
	const whitelist = ['.gitkeep','test.sh'];

	 files.filter((item,index)=>{
		if(!whitelist.includes(item)){
				fs.unlink(filePath+'/'+item,(err)=>{
					if(err)throw err;
					console.log(`${item} was deleted`);

				})
				return item;
		}
	});
};

const createFile = () =>{
	console.log('create File ');
	console.log(`realPath : ${filePath}`);	
	const today = moment().format('YY_MM_DD_HH:mm:ss');
	const fileName = 'Date_'+today;
	
	deleteFile();
	fs.open(filePath+"/"+fileName,'a',(err,fd)=>{
		if(err)throw err;
		fs.appendFile(fd,os.hostname(),'utf8',(err)=>{
			fs.close(fd,(err)=>{
				if(err)throw err;
			});
			if(err)throw err;
		});
	});
	
};




module.exports = router;
