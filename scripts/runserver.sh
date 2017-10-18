#!/bin/bash
if [[ $# -ne 1 ]]; then
    echo "usage: runserver.sh <repo_path>"
else
    knowledge_repo --debug --repo $1 runserver --port 8890
    # knowledge_repo --repo $1 --repo $2 --repo $3 ...etc riunserver
fi
