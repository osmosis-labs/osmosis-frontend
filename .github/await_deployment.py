import time
import requests
import os


def wait_for_deployment(timeout):
    branch_name = os.getenv('BRANCH_NAME')
    print(f"Wait for a deployment for a branch name: {branch_name}")
    time.sleep(30)
    bearer_token = os.getenv('VERCEL_TOKEN')
    project_id = os.getenv('VERCEL_PROJECT')
    target = os.getenv('VERCEL_TARGET', 'preview')
    headers = {
        "Authorization": f"Bearer {bearer_token}"
    }
    url = f"https://api.vercel.com/v6/deployments?projectId={project_id}&target={target}&state=BUILDING"
    response = requests.get(url, headers=headers)
    deployments = response.json()['deployments']
    print(f"Found {len(deployments)} deployments.")
    if len(deployments) == 0:
        raise Exception(f"No Vercel deployments in state=BUILDING for {branch_name}!")
    vercel_uid = ""
    vercel_url = ""
    for deployment in deployments:
        if deployment['meta']['githubCommitRef'] == branch_name:
            vercel_uid = deployment['uid']
            vercel_url = deployment['url']
    gh_out = f"environment_url={vercel_url}"
    os.system(f'echo "{gh_out}" >> $GITHUB_OUTPUT')
    os.system(f'echo "{gh_out}" >> $GITHUB_ENV')
    os.system(f'echo Vercel deployment: "{gh_out}" >> $GITHUB_STEP_SUMMARY')
    for i in range(1, timeout):
        print(f"Sleep for 15 seconds and get deployment uid {vercel_uid} and url: {vercel_url}")
        time.sleep(15)
        current_url = f"https://api.vercel.com/v13/deployments/{vercel_uid}"
        ui_url = f"https://vercel.com/osmo-labs/osmosis-frontend/{vercel_uid}"
        current_response = requests.get(current_url, headers=headers)
        status = current_response.json()['status']
        print(f"Status of deployment uid {vercel_uid} is {status}")
        if status == "READY":
            break
        if status == "ERROR":
            raise Exception(f"Vercel deployment {ui_url} has failed!")

    return f"environment_url={vercel_url}"


wait_for_deployment(80)
