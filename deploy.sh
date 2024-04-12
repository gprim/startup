#!/bin/bash

while getopts k:h:s: flag
do
    case "${flag}" in
        k) key=${OPTARG};;
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    printf "\nMissing required parameter.\n"
    printf "  syntax: deploy.sh -k <pem key file> -h <hostname> -s <service>\n\n"
    exit 1
fi

printf "\n----> Deploying React bundle $service to $hostname with $key\n"

# Step 1
printf "\n----> Build the distribution package\n"
rm -rf build
mkdir build
npm install # make sure vite is installed so that we can bundle
npm run build-server # build the ts back end
npm run build-vite # build the React front end
cp -rf dist build/public # move the React front end to the target distribution
cp package.json build/ # move package json files for node modules
cp package-lock.json build/
rm -rf dist

# Step 2
printf "\n----> Clear out the previous distribution on the target.\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
cp services/${service}/.env services/.env
rm -rf services/${service}
mkdir -p services/${service}
ENDSSH

NODE_SERVER_FOLDER="build"

# Step 3
printf "\n----> Copy the distribution package to the target.\n"
scp -r -i "$key" "$NODE_SERVER_FOLDER" ubuntu@$hostname:services/$service

# Step 4
printf "\n----> Turn on the server.\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
bash -i
mv services/.env services/${service}/.env
cd services/${service}
mv $NODE_SERVER_FOLDER/package.json ./
npm i --omit=dev
mv $NODE_SERVER_FOLDER/* ./
rm -rf $NODE_SERVER_FOLDER/
pm2 restart startup
ENDSSH

# Step 5
printf "\n----> Removing local copy of the distribution package\n"
rm -rf build
