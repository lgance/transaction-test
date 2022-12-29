#!/bin/sh
# Define Variable
ROOT_PATH=/root/
PROJECT_NAME=/transaction-test

# Get Status Node Status
get_server_node_status(){


echo "[Move to Project Path ${1}]"

 # FULL PATH
 cd $1
 # $2  => project name
 STDOUT=`npm run list`

echo "[CHECKING FOR THIS SERVER Agent ${2} ] "

  if [[ "$STDOUT" == *${2}Agent* ]]; then
	if [[ "$STDOUT" == *'pm2 save'* ]]; then
	  echo "PM2 싱크를 맞춥니다. ",
	  sudo npm run save
	  sudo npm run start
	  sudo npm run restart

        else
           echo "찾음"
           echo "${2} Server Status Success"
        fi
  else
        echo "못 찾음"
        echo "${2} Server Agent Restart"
        echo "RESTART AND START SERVER AGENT"
       # rm -rf /root/.pm2  - enable -> CPU 100% Memory 100% 
        sudo npm run save
	sudo npm run start
	sudo npm run restart
  fi

}


get_project_path(){

 PATH_LIST=`ls $ROOT_PATH`

 for path in ${PATH_LIST}
  do
     if [[ $path == *"serverNode"* ]]; then
        echo "[START] Agent Status Check ${path} "
        AGENT_ROOT_PATH="$ROOT_PATH$path$PROJECT_NAME"
        echo "[AGENT_ROOT_PATH ${AGENT_ROOT_PATH}]"
        get_server_node_status $AGENT_ROOT_PATH $path
     else
        echo "[NOT_CHECK] not Agent Path ${path} "
     fi
        echo " "
  done
}


date=`date +%T`

echo "---------------[Check Date ${date}]---------------"
get_project_path
                   
