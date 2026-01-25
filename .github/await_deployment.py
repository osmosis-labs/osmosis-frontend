import time
import requests
import os


def filter_deployments_by_branch(deployments, branch_name):
    """
    Filter deployments by git branch using metadata.
    Returns deployments matching the branch, or all deployments if branch is None.
    """
    if not branch_name:
        return deployments
    
    filtered = []
    for d in deployments:
        meta = d.get('meta', {})
        # Vercel stores branch info in various meta fields depending on git provider
        git_branch = meta.get('githubCommitRef') or meta.get('gitlabCommitRef') or meta.get('bitbucketCommitRef')
        if git_branch == branch_name:
            filtered.append(d)
    return filtered


def wait_for_deployment(timeout):
    branch_name = os.getenv('BRANCH_NAME')
    # Optional: filter by a specific branch for scheduled/synthetic monitoring
    filter_branch = os.getenv('FILTER_BRANCH')
    print(f"Wait for a deployment for a branch name: {branch_name} to start.")
    if filter_branch:
        print(f"Filtering deployments to branch: {filter_branch}")
    time.sleep(20)
    bearer_token = os.getenv('VERCEL_TOKEN')
    project_id = os.getenv('VERCEL_PROJECT')
    target = os.getenv('VERCEL_TARGET', 'preview')
    headers = {
        "Authorization": f"Bearer {bearer_token}"
    }
    url = f"https://api.vercel.com/v6/deployments?projectId={project_id}&target={target}&state=BUILDING"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch latest deployments: {response.text}")
    deployments = response.json()['deployments']
    print(f"Found {len(deployments)} deployments in BUILDING state.")
    
    # Apply branch filter if specified
    if filter_branch:
        deployments = filter_deployments_by_branch(deployments, filter_branch)
        print(f"After branch filter: {len(deployments)} deployments match branch '{filter_branch}'")
    
    if len(deployments) == 0:
        # Check for the latest deployment (fetch more to allow filtering)
        url = f"https://api.vercel.com/v6/deployments?projectId={project_id}&target={target}&limit=20"
        response = requests.get(url, headers=headers)
        deployments = response.json()['deployments']
        
        # Apply branch filter if specified
        if filter_branch:
            deployments = filter_deployments_by_branch(deployments, filter_branch)
            print(f"After branch filter on recent: {len(deployments)} deployments match branch '{filter_branch}'")
        
        if len(deployments) == 0:
            raise Exception(f"No Vercel deployments found for {branch_name}!" + (f" (filtered by {filter_branch})" if filter_branch else ""))
        print("No deployments in BUILDING state. Using the latest deployment.")

    vercel_uid = deployments[0]['uid']
    vercel_url = deployments[0]['url']
    gh_out = f"environment_url={vercel_url}"
    os.system(f'echo "{gh_out}" >> $GITHUB_OUTPUT')
    os.system(f'echo "{gh_out}" >> $GITHUB_ENV')
    os.system(f'echo Vercel deployment: "{gh_out}" >> $GITHUB_STEP_SUMMARY')
    for i in range(1, timeout):
        print(f"Sleep for 20 seconds and get deployment uid {vercel_uid} and url: {vercel_url}")
        time.sleep(20)
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


wait_for_deployment(30)
