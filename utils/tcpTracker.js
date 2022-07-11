const netstat = require('node-netstat');
function Tracker() {}

const netstatL = opts => new Promise((resolve, reject) => {
    const res = []
    netstat({
        ...opts,
        done: err => {
            if (err) 
                reject(err)
            resolve(res)
        }
    }, function (data) {
        return res.push(data.local.port);
    })
    //   resolve(res);
})

const netstatS = opts => new Promise((resolve, reject) => {
    const res = []
    netstat({
        ...opts,
        done: err => {
            if (err) 
                reject(err)
            resolve(res)
        }
    }, function (data) {
        return res.push(data.remote.port);
    })
    //   resolve(res);
})
Tracker.getSentPort = function (srcIP) {
    return new Promise(async (resolve, reject) => {
        netstatL({
            filter: {
                remote: {
                    address: srcIP
                },
                state: 'SYN_SENT',
                protocol: 'tcp'
            }
        }).then((data) => {
            resolve(data);
        })
    });
}

Tracker.getRecvPort = function (srcIP) {
    return new Promise(async (resolve, reject) => {
        netstatS({
            filter: {
                remote: {
                    address: srcIP
                },
                state: 'SYN_RECV',
                protocol: 'tcp'
            }
        }).then((data) => {
            resolve(data);
        })
    });
}

//Tracker.getSentPort("192.168.0.1");
module.exports = Tracker;
