import json
import time
import requests
import os


def wait_for_deployment(timeout):
    branch_name = os.getenv('BRANCH_NAME')
    print(f"Wait for a deployment for a branch name: {branch_name}")
    time.sleep(30)
    bearer_token = "rACOcrj1X6jMtXpkQZRMOWxp"
    project_id = "prj_80UzRn6hG8nvUJSwujWUqqho3osT"
    headers = {
        "Authorization": f"Bearer {bearer_token}"
    }
    url = f"https://api.vercel.com/v6/deployments?projectId={project_id}&target=preview&state=BUILDING"
    response = requests.get(url, headers=headers)
    deployments = response.json()['deployments']
    print(f"Found {len(deployments)} deployments.")
    if len(deployments) == 0:
        raise Exception(f"No Vercel deployments in state=BUILDING for {branch_name}!")
    vercel_uid = ""
    vercel_url = ""
    for deployment in deployments:
        if deployment['meta']['githubCommitRef'] == branch_name:
            print(json.dumps(deployment, indent=1))
            vercel_uid = deployment['uid']
            vercel_url = deployment['url']
    print(f'::set-output name=vercel_url::{vercel_url}')
    for i in range(1, timeout):
        print(f"Sleep for 60 seconds and get deployment uid {vercel_uid} and url: {vercel_url}")
        time.sleep(60)
        current_url = f"https://api.vercel.com/v13/deployments/{vercel_uid}"
        current_response = requests.get(current_url, headers=headers)
        status = current_response.json()['status']
        print(f"Status of deployment uid {vercel_uid} is {status}")
        if status == "READY":
            break
        if status == "ERROR":
            raise Exception(f"Vercel deployment {current_url} has failed!")


if __name__ == '__main__':
    wait_for_deployment(20)
