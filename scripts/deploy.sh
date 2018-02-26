#!/bin/bash
if [[ $# -ne 0 ]]; then
    echo "usage: deploy.sh"
else
    knowledge_repo --repo knowledgerepos deploy --dburi sqlite:///`pwd`knowledge.db --config knowledgerepos/server_config.py --engine flask --port=7000
    # knowledge_repo --repo $1 --repo $2 --repo $3 ...etc deploy
fi
