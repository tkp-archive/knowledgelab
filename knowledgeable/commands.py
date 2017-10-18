import knowledge_repo as kr
import nbformat
from os.path import join, exists
from knowledge_repo.app.deploy import KnowledgeDeployer, get_app_builder

default_header = '---\ntitle: This is a Knowledge Template Header\nauthors:\n- sally_smarts \n- wesley_wisdom\ntags:\n- knowledge\n- example\ncreated_at: 2016-06-29\nupdated_at: 2016-06-30\ntldr: This is short description of the content and findings of the post.\n---'


def repository(name):
    if exists(join('knowledgerepos', name)):
        return kr.KnowledgeRepository.for_uri(name)
    return kr.KnowledgeRepository.create_for_uri(name)


def prep(file, out):
    nb = nbformat.read(file)
    if 'kr' in nb.cells[0].metadata:
        return
    kr_node = nbformat.notebooknode.NotebookNode()
    kr_node.metadata = nbformat.notebooknode.NotebookNode()
    kr_node.metadata['kr'] = True
    kr_node.cell_type = 'raw'
    kr_node.source = default_header
    nb.cells.insert(0, kr_node)
    with open(out, 'w') as fp:
        nbformat.write(nb, fp)


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
