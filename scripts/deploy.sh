#!/bin/bash
if [[ $# -ne 0 ]]; then
    echo "usage: deploy.sh"
else
    knowledge_repo --repo knowledgerepos deploy --dburi sqlite:////tmp/knowledge.db --config knowledgerepos/server_config.py
    # knowledge_repo --repo $1 --repo $2 --repo $3 ...etc deploy
fi
