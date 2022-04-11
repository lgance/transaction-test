const express = require('express');
const router = express.Router();
const url = require('url');
const os = require('os');
const axios = require('axios');

require('dotenv').config();

const port = process.env.port;
//const timeOut = process.env.timeout;
const timeOut = 5000;
router.get('/', async (req,res,next)=> {
	try{
		const { srcIP,condition } = req.query;
		console.log('outboundRouter');
		console.log(req.query);
   
		const outboundURL = `http://${srcIP}:${port}/recv/nacl`;
   
		console.log(outboundURL);
	   let _response = {};
		
	   axios.get(outboundURL,{
		   timeout:timeOut
		})
		.then(response=>{
		   _response.data = response.data;
		   _response.status = response.status;
		   
		   if(condition && condition ==='false'){
			 _response.conditionCase='fail';
			 _response.desc="연결이 안되어야 성공 [ 현재 연결 됨 ]";
			 _response.result="fail";
			 res.send(_response);
		   }
		   else{
			 _response.conditionCase="pass";
			 res.send(_response);
		   }
	   })
	   .catch(err=>{
		   console.log('outbound Error');
		   
		   _response.code = err.code;
		   _response.originData = err;
		   console.log(_response);
		   
		   if(condition && condition ==='false'){
			   console.log('실패가 성공');
			   _response.conditionCase='pass';

			   console.log(_response);
			   res.send(_response);
		   }
		   else{
			   _response.conditionCase='fail';
			   res.send(_response);
		   }		
	   });	
		 }
   catch(error){
	 next(error);
   }
	// try{
	// 	const { srcIP,condition } = req.query;
		
	// 	const outboundUrl = `http://${srcIP}:${port}/recv/nacl`;
	// 	const outboundUrlCheck = `http://${srcIP}:${port}/recv/nacl`;

	// 	const response = await axios.get(outboundUrl);
	// 	const _response = await axios.get(outboundUrlCheck);

	// 	if(condition && condition === 'false'){
	// 		response.conditionCase='fail';
	// 		response.desc="연결이 안되어야 성공 [ 현재 연결 됨 ]";
	// 		response.result="fail";
	// 		res.send(response);
	// 	}
	// 	else{
	// 		response.conditionCase="pass";
	// 		res.send(response);
	// 	}
	// }
	// 	catch(error){
	// 		next(error);
	// 	}
});

module.exports = router;
