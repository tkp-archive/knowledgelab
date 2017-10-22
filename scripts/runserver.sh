#!/bin/bash
if [[ $# -ne 0 ]]; then
    echo "usage: runserver.sh"
else
    knowledge_repo --debug --repo knowledgerepos runserver --port 8890 --dburi sqlite:////tmp/knowledge.db --config knowledgerepos/server_config.py
    # knowledge_repo --repo $1 --repo $2 --repo $3 ...etc riunserver
fi
