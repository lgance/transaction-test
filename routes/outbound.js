const express = require('express');
const router = express.Router();
const url = require('url');
const os = require('os');
const axios = require('axios');
const TCPTracker = require('../utils/tcpTracker');

require('dotenv').config();

const port = 6500;
//const timeOut = process.env.timeout;
const timeOut = 5000;

router.get('/', async (req, res, next) => {
    try {
        const {srcIP, condition} = req.query;
        console.log('outboundRouter');
        console.log(req.query);

        const outboundURL = `http://${srcIP}:${port}/recv/nacl`;
        console.log(outboundURL);
        let _response = {};

        axios
            .get(outboundURL, {timeout: timeOut})
            .then(response => {
                _response.data = response.data;
                _response.status = response.status;

                if (condition && condition === 'false') {
                    _response.conditionCase = 'fail';
                    _response.desc = "연결이 안되어야 성공 [ 현재 연결 됨 ]";
                    _response.result = "fail";
                    res.send(_response);
                } else {
                    _response.conditionCase = "pass";
                    _response.result = "pass";
                    res.send(_response);
                }
            })
            .catch(err => {
                console.log('outbound Error');
                _response.code = err.code;
                _response.originData = err;
                console.log(_response);

                if (condition && condition === 'false') {
                    console.log('실패가 성공');
                    _response.conditionCase = 'pass';
                    _response.result = "pass";
                    console.log(_response);
                    res.send(_response);
                } else {
                    _response.conditionCase = 'fail';
                    _response.result = "fail";
                    res.send(_response);
                }
            });
        _response.tcpSentPort = await TCPTracker.getSentPort(srcIP);
        console.log("tcpSentPort:", _response.tcpSentPort);
    } catch (error) {
        next(error);
    }

    // try{ 	const { srcIP,condition } = req.query; 	const outboundUrl =
    // `http://${srcIP}:${port}/recv/nacl`; 	const response = await
    // axios.get(outboundUrl, {timeout: timeOut}); 	let _response = {}; 	const
    // tcpSentPort = TCPTracker.getSentPort(srcIP); 	console.log(response);
    // if(response.data.result === "pass"){ 		_response.desc="연결이 되어야 성공 [ 현재 연결 됨
    // ]" 		_response.result="pass"; 		_response.tcpSentPort = tcpSentPort;
    // res.send(_response); 	} 	else if(condition && condition === 'false' &&
    // response.data.result === "pass"){ 		_response.desc="연결이 안되어야 성공 [ 현재 연결 됨 ]";
    // _response.result="fail"; 		_response.tcpSentPort = tcpSentPort;
    // res.send(_response); 	} 	else if(condition && condition === 'false' &&
    // response.data.result === "fail"){ 		_response.desc="연결이 안되어야 성공 [ 현재 연결 안됨 ]"
    // _response.result="pass"; 		_response.tcpSentPort = tcpSentPort;
    // res.send(_response); 	} 	else{ 		_response.desc="연결이 되어야 성공 [ 현재 연결됨 ]"
    // _response.result="fail"; 		_response.tcpSentPort = tcpSentPort;
    // res.send(_response); 	} } 	catch(error){ 		next(error); 	}
});

router.get('/check', async (req, res, next) => {
    try {
        const {srcIP} = req.query;
        let response = {};
        response.tcpRecvPort = await TCPTracker.getRecvPort(srcIP);
        console.log("tcpRecvPort:", response.tcpRecvPort);

        res.send(response)
    } catch (error) {
        next(error);
    }
});

module.exports = router;
