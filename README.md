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
Server A : 99.99.99.99
Server B : 11.11.11.11
Server Port : 6500

**Server B -> Server A Connect Test 
* http://11.11.11.11:6500/send?srcIP=99.99.99.99

**Server A -> Server B Connect Test and IP Check 
* http://99.99.99.99:6500/send?srcIP=10.99.0.2&checkIP=10.99.0.1

**Server A -> Server B UDP Test 
* http://10.99.0.1:6500/send/udp/sendOnly?srcIP=10.99.0.2



### Recv Router ( /recv ) 
** Required Param **

* /recv
* /recv/nacl
* /recv/check
* /recv/udp


### Out Bound Router ( /outbound ) 
** Required Param **
* /outbound



## NACL Example
* 1. outbound 
* 2. /recv/check - nacl file check    ( after modify )

