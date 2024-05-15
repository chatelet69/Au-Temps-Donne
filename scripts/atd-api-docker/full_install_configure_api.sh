#!/bin/bash

actualLocation=$PWD

if [[ $EUID -ne 0 ]]; then
    echo "Please run the script as root"
    exit 100
fi

echo "----------------Start of the installation----------------"

echo "The Global folder will be 'atd'"
echo "Enter nothing to confirm or type the name that you want"

read folderName

if [ "$folderName" == "" ]; then
    folderName="atd"
fi

CUR_USER=$SUDO_USER
USER_HOME="/home/$SUDO_USER"

runuser $CUR_USER -c "cd $USER_HOME"
runuser $CUR_USER -c "mkdir -p $USER_HOME/$folderName"
runuser $CUR_USER -c "cd $USER_HOME/$folderName"

if [ -d $USER_HOME/$folderName/Au-temps-donne ]; then
    echo "Au-temps-donne already exists, the script need to delete it or actualize it"
    echo "Type Y to continue and delete it, or N to stop"
    read deleteAtdRepoChoice
    if [ "$deleteAtdRepoChoice" == "N" ]; then
        echo "Script stopped"
        exit 100
    fi
fi

runuser $CUR_USER -c "rm -rf $USER_HOME/$folderName/Au-temps-donne"
runuser $CUR_USER -c "cd $USER_HOME/$folderName/ && git clone git@github.com:chatelet69/Au-temps-donne.git"
runuser $CUR_USER -c "cd $USER_HOME/$folderName/Au-temps-donne && git checkout dev"
runuser $CUR_USER -c "cd $USER_HOME/$folderName/atd-api"
runuser $CUR_USER -c "mv --backup -i $USER_HOME/$folderName/Au-temps-donne/atd-api $USER_HOME/$folderName"
runuser $CUR_USER -c "rm -rf $USER_HOME/$folderName/Au-temps-donne"
runuser $CUR_USER -c "cp $actualLocation/config.json $USER_HOME/$folderName/atd-api/config.json"
runuser $CUR_USER -c "cp $actualLocation/.env $USER_HOME/$folderName/atd-api/.env"

echo "Do you want to build the Docker Image and start the Api Container"
echo "[Y (Yes) / N (No)]"

# Ask the user

read dockerChoice

if [ "$dockerChoice" == "Y" ]
    then
        runuser $CUR_USER -c "cp $actualLocation/Dockerfile $USER_HOME/$folderName/atd-api/Dockerfile"
        cd $USER_HOME/$folderName/atd-api && docker image build --tag atd_api_image:latest . && docker run -dit -p 8081:8081 --name api_container atd_api_image:latest
        echo "Api container started"
fi

echo "Do you want to configure the Apache2 Web service for the Api ?"
echo "[Y (Yes) / N (No)]"

read apacheChoice

if [ "$apacheChoice" == "Y" ]
then
    echo "Ok"
else
    echo "No"
fi

echo "----------------End of the Api Full Install----------------"

exit 0