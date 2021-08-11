const {spawn,exec} = require('child_process');

const moment = require('moment');
const { ENGINE_METHOD_DIGESTS } = require('constants');

function Tracker(){}
/*
 * @param 
 * options Object 
 * options.protocol = ['udp','tcp','icmp']  : default 'udp'
 * options.networkInterface = ['eth0']      : default 'eth0'
 * options.port = ['6500']                  : default '6500'
 * options.host = ['10.0.0.1']              : default 'empty'
 * options.timeout = 2000 		    : default 2000  (type Number)
 * 
 */
Tracker.next = true ; /* Watch loop flag */


/* 0 WAIT  */
/* 1 READY */
/* 2 CLOSEING */
Tracker.status = {
  'udp':0,
  'tcp':[],
  'icmp':[]
}




Tracker.state  = {
   'udp':{
     'state':false	
   },
   'tcp':{
     'state':false
   },
   'icmp':{
     'state':false
   }
} 
Tracker.timer = {
   'udp':{
     '_timer':''
   },
   'tcp':{
     '_timer':''
   },
   'icmp':{
      '_timer':''
   }
};

Tracker.udpReady = function(){
  return new Promise(async(resolve,reject)=>{
     try{
	if(this.status.udp===1){
	  console.log('UDP Process is Exist');
	  resolve(false); 
	}
        else{
   	  /* READY */
    	  this.status.udp=1;	     
    	  let udpSubProcessID = this.udpDumpStart();
   	  console.log('UDP Process is Create ');
   	  resolve(true);
        }
     }
     catch(err){
      console.error(err);
      reject(err.message);
     }
  });
}
Tracker.udpBufferClose = function(){
 return new Promise(async(resolve,reject)=>{
   try{
     if(this.process && this.status.udp===1){
	this.process.kill('SIGHUP');
	console.log('State');
	this.getState('udp');
	this.status.udp=0;
	console.log('PROCESS SUCCESS KILL');
	resolve(true);
     }
     else{
      console.log('NOT PROCESS');
      resolve(false);
     }
   }
   catch(err){
     console.error(err);
     reject(err.message);
   }
 });
}
Tracker.udpDumpStart = function(options,callback){
  return new Promise(async(resolve,reject)=>{
   try{
   	console.log('test UDP Dump Start'); 	  	
	let _command = 'tcpdump';
	if(typeof options ==='function'){ callback = options;}
	let _options = options || {};
	let _protocol = _options.protocol || 'udp';
	let _nic = _options.networkInterface || 'eth0';
	let _port = _options.port || '6500';
	let _host = _options.host || false;
  
	let _timeout = _options.timeout || 2000;	
	let _dumpoptions = ['-v','-i',_nic,_protocol,'and','port',_port];
	/* tcpdump -v -i eth0 udp and port 6500  */
	if(_host !== false){
		_dumpoptions = ['-v','-i',_nic,_protocol,'and','port',_port,'and',_host];
		 /* tcpdump -v -i eth0 udp and port 6500 and host 10.0.0.1 */
	}
  	  let _this = this;
	  let subprocess = spawn(_command,_dumpoptions);
	  subprocess.stdout.on('data',function(data){
	      let packet = data.toString();
	      let packetLength = packet.split('\n').length;
	        if(packetLength > 2){
	          console.log('UDP Packet Recv');
	          console.log(packet);
	          _this.setState('udp');
		  _this.udpBufferClose();
	        }
	        else{
	          console.log('UDP Packet Not Recv');
	        }
	  });		
 	 subprocess.on('exit',function(code,signal){
 	   if(code){
	      console.log('sub Process terminated with code ',code);
	      throw new Error('Please Check your Permission UDP Test is get root authority');
	   }
	   else if(signal){
	      console.log('sub Process terminated because of signal ',signal);
  	   }
	   else{
	      console.log('sub Process terminated unKnown code and signal');
	  }
	  });

        console.log(`[pid] : ${subprocess.pid}`);
	//		resolve(subprocess);
	this.setProcess(subprocess);
	resolve(subprocess.pid);
   }
   catch(err){
    console.log('UDP Dump Start Error ');
    console.log(err);	
    reject(err.message);
  }
  });
}




/* will be deprecated soon   below this code Legacy Code  */
Tracker.getNext = function(){
	return this.next;
}

Tracker.Watch  = function(w_flag){
	if(typeof w_flag !=='boolean'){return false;}
	this.next = w_flag;
}
Tracker.setProcess = function(process){
  this.process = process;
}
Tracker.getPacket = function(){
  return new Promise((resolve,reject)=>{
    if(this.process){
      this.process.kill('SIGHUP');
      this.udpStart();
      setTimeout(()=>{
        resolve('UDP State Change');
      },1000);
    }
    else{
      resolve('NOT PROCESS');
    }
  });
}
Tracker.tcpDump = function(options,callback){
  let _command = 'tcpdump';

  if(typeof options ==='function'){ callback = options;}
  let _options = options || {};
  let _protocol = _options.protocol || 'udp';
  let _nic = _options.networkInterface || 'eth0';
  let _port = _options.port || '6500';
  let _host = _options.host || false;
  
  let _timeout = _options.timeout || 2000;	
  let _dumpoptions = ['-v','-i',_nic,_protocol,'and','port',_port];
  /* tcpdump -v -i eth0 udp and port 6500  */
  if(_host !== false){
    _dumpoptions = ['-v','-i',_nic,_protocol,'and','port',_port,'and',_host];
      /* tcpdump -v -i eth0 udp and port 6500 and host 10.0.0.1 */
  }
  
  let _this = this;
  let subprocess = spawn(_command,_dumpoptions);
  subprocess.stdout.on('data',function(data){
      let packet = data.toString();
      let packetLength = packet.split('\n').length;
        if(packetLength > 2){
          console.log('UDP Packet Recv');
          console.log(packet);
          _this.setState('udp');
        }
        else{
          console.log('UDP Packet Not Recv');
        }
  });		
  subprocess.on('exit',function(code,signal){
    if(code){
      console.log('sub Process terminated with code ',code);
      throw new Error('Please Check your Permission UDP Test is get root authority');
    }
    else if(signal){
      console.log('sub Process terminated because of signal ',signal);
    }
    else{
      console.log('sub Process terminated unKnown code and signal');
    }
  });
  console.log(`[pid] : ${subprocess.pid}`);


}
Tracker.udpStart = function(){
  this.tcpDump();
}
Tracker.getState = function(protocol){
	return this.state[protocol]['state'];
}
Tracker.setState = function(protocol){
        if(this.state[protocol]['state']===true){

          clearTimeout(this.timer[protocol]['_timer']);

          this.timer[protocol]['_timer'] = setTimeout(()=>{
              this.state[protocol]['state'] = false;
          },10000);
        }
        else{
           this.state[protocol]['state'] = true;
           this.timer[protocol]['_timer'] = setTimeout(()=>{
                 this.state[protocol]['state'] = false;
           },10000);
        }
}
	
/* To do */
Tracker.tcpScan = function(options,callback){}
Tracker.icmpScan = function(options,callback){}


/************************ Deprecated *************************/

function RUN(options,callback){
  return new Promise((resolve,reject)=>{
    let _command = 'tcpdump';

    if(typeof options ==='function'){ callback = options;}
    let _options = options || {};
    let _protocol = _options.protocol || 'udp';
    let _nic = _options.networkInterface || 'eth0';
    let _port = _options.port || '6500';
    let _host = _options.host || false;
    
    let _timeout = _options.timeout || 2000;	
    let _dumpoptions = ['-v','-i',_nic,_protocol,'and','port',_port];
    /* tcpdump -v -i eth0 udp and port 6500  */
    if(_host !== false){
      _dumpoptions = ['-v','-i',_nic,_protocol,'and','port',_port,'and',_host];
        /* tcpdump -v -i eth0 udp and port 6500 and host 10.0.0.1 */
    }
    
    let subprocess = spawn(_command,_dumpoptions);
    subprocess.stdout.on('data',function(data){
        resolve(data.toString());
    });		
    subprocess.on('exit',function(code,signal){
      if(code){
        console.log('sub Process terminated with code ',code);
	      throw new Error('Please Check your Permission UDP Test is get root authority');
      }
      else if(signal){
        console.log('sub Process terminated because of signal ',signal);
      }
      else{
        //console.log('sub Process terminated unKnown code and signal');
      }
    });
    console.log(`[pid] : ${subprocess.pid}`);

    setTimeout(function(){
      subprocess.kill('SIGHUP');
    },_timeout);
  });
}

/* 
 * Tracker.udpScan({
 *    timeout : 1000
 * },function(packet){
 *	let pLength = packet.split('\n').length;
 *	if(pLength > 2){
 *		console.log('UDP Pakcet Scan !!');
 *		console.log(packet);
 *	}
 *	else{ console.log('UDP Packet is Empty');}
 * })
 *
 *
 * */
let beforeTime;
let currTime;
let tempTime = 0;
let cnt= 0;
Tracker.udpScan = function(options,callback){
  try{
       cnt++;
       if(cnt===1){beforeTime=new Date().getTime();}
       else{
         currTime = new Date().getTime();
         tempTime = currTime - beforeTime;
         beforeTime = currTime;
      }
      console.log(`\r\n [cnt] : ${cnt} IntervalTime : ${tempTime/1000} 초 \r\n`);

      RUN(options)
      .then(packet=>{
          let packetLength = packet.split('\n').length;
          if(packetLength > 2){
            console.log('UDP Packet Scan !!');
            console.log(packet);
            this.setState('udp');
          }
          else{
            console.log(`UDP Packet Listening ..... [${this.getState('udp')}]`);
          }
          this.udpScan({timeout:options.timeout});
      })
      .catch(err=>{
        console.log('UDP RUN Error');
        console.log(err);
      })
  }
  catch(err){
	  console.log('[*] Tracker udpScan Error !');
	  console.log(err);
  }
}

module.exports = Tracker;




