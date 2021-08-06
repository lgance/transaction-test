/**Baisc node Module  */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const os = require('os');

/** NPM Node Module  ref - package.json */
const express = require('express');
// const axios = require('axios');
const cors = require('cors');
const favicon  = require('serve-favicon');
const moment = require('moment');
const cron = require('node-cron');
/* User Define Router Import */

const indexRouter = require('./routes/index');
const sendRouter = require('./routes/send');
const recvRouter = require('./routes/recv');
const outboundRouter = require('./routes/outbound');
const managementRouter = require('./routes/management');

/* Import tqm Tracker */

const Tracker = require('./utils/tcpTracker');

const TestMode = !process.argv[2]
? 'acg'
:(!!['nacl','udp'].includes(process.argv[2].toLowerCase())
    ? process.argv[2].toLowerCase()
    : 'acg');

/** define variable */
// const port = 6500;
const app = express();
const port = process.env.AGENT_SERVER_PORT;
require('dotenv').config();

//server favicon
app.use(favicon(path.join(__dirname,'public/res/','favicon.ico')));

/** Settings Middle ware in express */
app.use(cors());
app.use('/',indexRouter);
app.use('/send',sendRouter);
app.use('/recv',recvRouter);
app.use('/outbound',outboundRouter);
app.use('/management',managementRouter);



/** ex: Internal Error 4xx Middleware  */
app.use((req,res,next)=>{
    console.log('Internal Server Error 4xx');
    const currentStatus = 400;
    let testMessage = "test Internal Server Error 4xx 일치하는 주소가 없을 경우 ";
    res.status(currentStatus).send(testMessage);

});

/** Server Listen  */
app.listen(port,()=>{
    console.log(`Running at Server Node Client : ${port} Listening `);
})

/** Express Server Error Handling Middle ware */
app.use((err,req,res,next)=>{
    console.log('Internal Server Error');
    const statusCode = 500;
    res.status(statusCode).send(err.message);
});


// every day 1pm 
cron.schedule('0 1 * * *',()=>{
  console.log('Automation Log ReCycle');
  const ls = spawn('pm2',['flush']);
  ls.stdout.on('data',(data)=>{
    console.log(`stdout:${data}`);
    console.log(moment().format('MMMM Do YYYY,h:mm:ss a'));

  });
});
