const express = require('express');
const router = express.Router();
const url = require('url');
const os = require('os');
const axios = require('axios');

/*
 * UDP define
 */
const dgram = require('dgram');

require('dotenv').config();

const port = process.env.port;
const timeOut = process.env.timeout;
// 테스트 결과 서버로 전송 
router.get('/',(req,res,next)=>{
    try {
    
    const {srcIP,dstIP,targetPort,checkIP} = req.query;
    console.log('sendRouter');    
    console.log(req.query);
  
    var { condition } = req.query;
 
    let sendUrl = `http://${srcIP}:${port}/recv?checkIP=${checkIP}`;
 
    if(targetPort && targetPort!=="6500"){
	sendUrl = `http://${srcIP}:${targetPort}`;
    }


    axios.get(sendUrl,{
            timeout:timeOut
    })
    .then(response=>{
        console.log('send Success');
       let _response = {};
       _response.data = response.data;
       _response.status = response.status;
       
	// 실패가 성공일 경우에 대한 케이스인데
	// then 으로 오고 condition 이 false이면 테스트 실패
	if(condition && condition==='false'){ 
	   _response.conditionCase="fail";
	   _response.desc="연결이 안되어야 성공 [ 현재 연결됨 ] ";
	   _response.result="fail";
	   res.send(_response);
	}
	// condiiton 이 없는 형태로 then 으로 넘어올신 성공 
	else{
	    _response.conditionCase="pass";
	    _response.desc="연결이 되어야 성공 [ 현재 연결 됨 ] ";
	    _response.result="pass";
            res.send(_response);
	}
    })
    .catch(err=>{

	let _response = {};
	_response.data = err.data;
	_response.code = err.code;
	_response.originData = err;
	
	/* from Recv Server Error Message*/
    	_response.originResponse = err.response!==undefined ? err.response.data : '[Empty]';
       
 	
	console.log(err.config);
	console.log(err.message);
        
	/*   NOT CONNECTED is Pass 
         *   실패가 성공일 경우 condition 이 false로 넘어옴 
         */
        if(condition && condition==='false'){
	    console.log('실패가 성공인 케이스');
	    _response.result="pass";
            _response.desc="연결이 안되면 성공 [ 현재 연결 안됨 ]";
	    _response.conditionCase="pass";
	    res.send(_response);
	}
	/* NOT CONNECTED is Fail */
        else{
	    _response.conditiionCase="fail";
	    _response.result="fail";
	    _response.desc="연결이 안되면 실패 [ 현재 연결 안됨 ]";
	    //res.send(err);
	    res.send(_response);
        }
    })

    } catch (error) {
        next(error);
    }
});

router.get('/udp/sendOnly',async (req,res,next)=>{
	try{
	  const { srcIP,targetPort } = req.query;
	  console.log('udpSend Only Router ');
	  console.log(req.query);

	  let sendUrl = `http://${srcIP}:${port}/recv/udp`;
	  var { condition } = req.query;
	  
	  if(targetPort && targetPort!=="6500"){
			sendUrl = `http://${srcIP}:${targetPort}`;
			port = targetPort;
	  }
	
	  /* UDP Send to Target Server  */
  	  let udpMessage  = Buffer.from('UDP_SEND_TO_ONLY');

	  console.log(`[1] UDP Send Ready targetServer : ${srcIP}`);

	  const udpSendFn = (msg,port,target) =>{
		return new Promise((resolve,reject)=>{
		  let client = dgram.createSocket('udp4');
		  client.send(msg,0,msg.length,port,target,(err,bytes)=>{
				if(err){console.log(`Error : ${msg} UDP Fail`); console.log(err);reject(false);}
				console.log(`[2] UDP Send Complete targetServer: ${target}`);
				client.close();
				resolve(true);
		  });
		});
		}

		/** After Deprecated Function */
		const udpSendFnRefact = (msg,port,target,flag)=>{
			return new Promise((resolve,reject)=>{
				let client = dgram.createSocket('udp4');
				client.send(msg,0,msg.length,port,target,(err,bytes)=>{
					if(err){console.log(`Error : ${msg} UDP Fail`); console.log(err);reject(false);}
					flag===true? '' : console.log(`[S] UDP Send Complete targetServer : ${target}`);
					client.close();
					resolve(true);
				})
			});
		}
		const keepSendUdp = async (timeout)=>{
			return new Promise((resolve,reject)=>{
				let udpMessage = Buffer.from('KEEP_UDP_SEND');
				let fnDateTime = new Date().getTime();
				let timeCondition = 0;
				let callCnt = 0 ;
				while(timeCondition < 1 ){

					let currTime = new Date().getTime() - fnDateTime;
					timeCondition = Math.floor(currTime/timeout);
					/** UDP Send Throttle */
					if((currTime%300)===0){
						udpSendFnRefact(udpMessage,port,srcIP);
						callCnt++;
					}
				}
				resolve(`Send Count ${callCnt}`);
			});
		}
	  let udpResult = await udpSendFn(udpMessage,port,srcIP);  

		if(!udpResult){
			res.send({msg:'UDP Send Fail',result:'fail'})
		}
		else{
			 let keepUDPResult = await keepSendUdp(1000);
			 console.log(keepUDPResult);
		};
		
	  let _response = {};
	  _response.data = udpResult;
	  _response.msg ="UDP 트래픽만 전송 [성공]";
	  _response.result="pass";
	  res.send(_response);
	  
	}
	catch(err){
	  let _response = {};
	  _response.data = false;
	  _response.originData = err;
	  _response.result="fail";
   	  _response.msg ="UDP send Promise Fail ";	
	  res.send(_response);

	}
});
router.get('/udp',(req,res,next)=>{
	try{
	  const { srcIP,dstIP,targetPort } = req.query;

	  const message='UDP Message';
	  console.log('udpRouter Send to ',srcIP);
	  console.log(req.query);
	  
	  let sendUrl = `http://${srcIP}:${port}/recv/udp`;
	  var { condition } = req.query;

	  if(targetPort && targetPort!=="6500"){
		sendUrl = `http://${srcIP}:${targetPort}`;
	  }
	
	  /* UDP Send to Target Server  */
          let client = dgram.createSocket('udp4');
	  
	  client.send(message,0,message.length,port,srcIP,function(err,bytes){
		if(err){
		  console.log('udp Error');	
		  console.log(err);
		  throw err;
		}
		console.log(`UDP Send Complete ip:${srcIP} port:${port} msg:${message}`);
		client.close();
	  });
	  
     	   /* Target Server UDP Inbound Check */
	   axios.get(sendUrl,{
		timeout:timeOut	
	   })
	   .then(response=>{
		console.log('udp Send Success');
		let _response = {};
		_response.data = response.data;
		_response.status = response.status;

		/* condition false is then -> Fail */
		if(condition && condition ==='false'){
		  _response.conditiionCase = 'fail';
		  _response.desc="연결이 안되어야 성공 [ 현재 연결됨 ] ";
		  _response.result="fail";
		  res.send(_response);
		}
		
		/* condition true is then -> Pass  */
		else{
		  _response.conditionCase ="pass";
		  _response.desc="연결이 되어야 성공 [ 현재 연결 됨 ] ";
		  _response.result="pass";
		  res.send(_response);
		}	

	   })
	   .catch(err=>{
			let _response = {};
			_response.data = err.data;
			_response.code = err.code;
			_response.originData = err;	
			
			console.log(err.config);
			console.log(err.message);	

		if(condition && condition==='false'){
		    console.log('실패가 성공인 케이스');
		    _response.result="pass";
	            _response.desc="연결이 안되면 성공 [ 현재 연결 안됨 ]";
		    _response.conditionCase="pass";
		    res.send(_response);
		}
		else{
	    	_response.conditiionCase="fail";
		    _response.result="fail";
		    _response.desc="연결이 안되면 실패 [ 현재 연결 안됨 ]";
	   	    res.send(_response);
	        }
	   });

	}
	catch(err){
	   let _response = {};
 	   _response.data = err.data;
	   _response.code = err.code;
	   _response.originData = err;
	   _response.result="fail";
   	   _response.desc="UDP Send Fail";
	   res.send(_response);
	}
});

module.exports = router;
