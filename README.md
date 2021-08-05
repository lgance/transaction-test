# transaction-test
Transaction Test Agent


## Feature
* TCP Check ( Allow , Deny ) 
* UDP Packet Check ( used TCP Dump ) 

## Router

### Send Router  ( /send )
**Required Param ** 
srcIP : Source IP 
dstIP : Dest IP 
targetPort : target Port 
checkIP : IP Check  -> if true ->  Added Source Agent IP === Check IP 
* /send
* /send/udp/sendOnly
* /send/udp

## Example
Server A : 10.99.0.1
Server B : 10.99.0.2
Server Port : 6500
Server B -> Server A Connect Test 
* http://10.99.0.2:6500/send?srcIP=10.99.0.1

response.data.result="pass or fail"

Server A -> Server B Connect Test and IP Check 
* http://10.99.0.1:6500/send?srcIP=10.99.0.2&checkIP=10.99.0.1



### Recv Router ( /recv ) 
** Required Param **
* /recv
* /recv/nacl
* /recv/check
* /recv/udp


### Out Bound Router ( /outbound ) 
** Required Param **
* /outbound





