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

printf "\n----> Deploying files for $service to $hostname with $key\n"

# Step 1
printf "\n----> Clear out the previous distribution on the target.\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
rm -rf services/${service}
mkdir -p services/${service}
ENDSSH

NODE_SERVER_FOLDER="output"

# Step 2
printf "\n----> Copy the distribution package to the target.\n"
scp -r -i "$key" "$NODE_SERVER_FOLDER" ubuntu@$hostname:services/$service

# Step 3
printf "\n----> Turn on the server.\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
bash -i
cd services/${service}
mv output/package.json ./
npm i --omit=dev
mv output/* ./
rm -rf output/
pm2 restart startup
ENDSSH
