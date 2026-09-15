import os
import time

import requests


def fetch_branch_deployments(headers, project_id, target, branch_name):
    url = (
        f"https://api.vercel.com/v6/deployments?projectId={project_id}"
        f"&target={target}&limit=20"
        f"&meta-githubCommitRef={branch_name}"
    )
    response = requests.get(url, headers=headers, timeout=30)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch latest deployments: {response.text}")
    return response.json().get("deployments") or []


def pick_deployment(deployments, github_sha):
    if github_sha:
        matching = [
            d
            for d in deployments
            if (d.get("meta") or {}).get("githubCommitSha", "").startswith(github_sha)
        ]
        if matching:
            return matching[0]
    return deployments[0] if deployments else None


def wait_for_deployment(timeout):
    branch_name = os.getenv("BRANCH_NAME")
    github_sha = (os.getenv("GITHUB_SHA") or "")[:40]
    print(
        f"Wait for a deployment for branch {branch_name} sha {github_sha or '(none)'}."
    )
    bearer_token = os.getenv("VERCEL_TOKEN")
    project_id = os.getenv("VERCEL_PROJECT")
    target = os.getenv("VERCEL_TARGET", "preview")
    headers = {"Authorization": f"Bearer {bearer_token}"}

    deployment = None
    for _ in range(timeout):
        deployments = fetch_branch_deployments(
            headers, project_id, target, branch_name
        )
        print(f"Found {len(deployments)} deployments for {branch_name}.")
        deployment = pick_deployment(deployments, github_sha)
        if deployment:
            status = deployment.get("readyState") or deployment.get("state")
            print(
                f"Picked {deployment.get('uid')} url={deployment.get('url')} status={status}"
            )
            if status in ("READY", "ERROR", "CANCELED"):
                break
            if status in ("BUILDING", "QUEUED", "INITIALIZING"):
                time.sleep(20)
                continue
        time.sleep(20)

    if not deployment:
        raise Exception(f"No Vercel deployments found for {branch_name}!")

    vercel_uid = deployment["uid"]
    vercel_url = deployment["url"]
    gh_out = f"environment_url={vercel_url}"
    os.system(f'echo "{gh_out}" >> $GITHUB_OUTPUT')
    os.system(f'echo "{gh_out}" >> $GITHUB_ENV')
    os.system(f'echo Vercel deployment: "{gh_out}" >> $GITHUB_STEP_SUMMARY')

    ui_url = f"https://vercel.com/osmo-labs/osmosis-frontend/{vercel_uid}"
    for _ in range(timeout):
        current_response = requests.get(
            f"https://api.vercel.com/v13/deployments/{vercel_uid}",
            headers=headers,
            timeout=30,
        )
        status = current_response.json()["status"]
        print(f"Status of deployment uid {vercel_uid} is {status}")
        if status == "READY":
            return gh_out
        if status == "ERROR":
            raise Exception(f"Vercel deployment {ui_url} has failed!")
        time.sleep(20)

    raise Exception(f"Timed out waiting for Vercel deployment {ui_url}")


wait_for_deployment(30)

