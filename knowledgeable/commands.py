from os.path import join, exists
import knowledge_repo as kr
from knowledge_repo.app.deploy import KnowledgeDeployer, get_app_builder


def repository(name):
    if exists(join('knowledgerepos', name)):
        return kr.KnowledgeRepository.for_uri(name)
    return kr.KnowledgeRepository.create_for_uri(name)


def post(repo, name, message="New revision"):
    kp = kr.KnowledgePost.from_file(name, format='ipynb')
    if repo.has_post(name):
        repo.add(kp, path=name, update=True, message=message)
        repo.submit(name)
    else:
        repo.add(kp, path=name, message=message)
        repo.submit(name)


def deploy(repos, config=None):
    app_builder = get_app_builder(repos,
                                  debug=True,
                                  db_uri=None,
                                  config=config,
                                  INDEXING_ENABLED=True)
    KnowledgeDeployer.using('gunicorn')(
        app_builder,
        host='0.0.0.0',
        port=8890
        ).run()
