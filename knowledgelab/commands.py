import knowledge_repo as kr
import nbformat
import ujson
from datetime import datetime
from os import makedirs
from os.path import join, exists
from knowledge_repo.app.deploy import KnowledgeDeployer, get_app_builder

default_header = '---\ntitle: This is a Knowledge Template Header\nauthors:\n- sally_smarts \n- wesley_wisdom\ntags:\n- knowledge\n- example\ncreated_at: 2016-06-29\nupdated_at: 2016-06-30\ntldr: This is short description of the content and findings of the post.\n---'


def _gen_hash(nb):
    return hash(ujson.dumps(nb))


def repository(name):
    if exists(join('knowledgerepos', name)):
        return kr.KnowledgeRepository.for_uri(name)
    return kr.KnowledgeRepository.create_for_uri(name)


def metadata_to_header(title, authors, tags, tldr, created, updated, private):
    ret = []
    ret.append('---\n')
    ret.append('title: ' + title + '\n')
    ret.append('authors:\n')
    for author in authors:
        ret.append('- ' + author + '\n')
    ret.append('tags:\n')
    for tag in tags:
        ret.append('- ' + tag + '\n')
    ret.append('created_at: ' + created.strftime('%Y-%m-%d %H:%M:%S') + '\n')
    ret.append('updated_at: ' + updated.strftime('%Y-%m-%d %H:%M:%S') + '\n')
    ret.append('tldr: ' + tldr + '\n')
    ret.append('private: ' + str(private) + '\n')
    ret.append('---')
    return ret


def nb_to_kp(nb_path, **knowledge_repo_data):
    # read notebook from file
    nb = nbformat.read(nb_path, 4)

    # get knowledgepost metadata
    title = knowledge_repo_data.get('title')
    authors = knowledge_repo_data.get('authors')
    tags = knowledge_repo_data.get('tags')
    tldr = knowledge_repo_data.get('tldr')
    private = knowledge_repo_data.get('private', False)
    updated = datetime.now()
    path = nb_path

    # if already have a record
    if 'knowledge' not in nb.metadata or not exists(nb.metadata.knowledge.post_path):
        # new knowledge post, generate id and path for KR copy
        id = str(abs(_gen_hash(nb)))
        created = datetime.now()
        post_folder = join('knowledgerepos', id)
        post_path = join(post_folder, 'post.ipynb')

        nb.metadata.knowledge = {}
        nb.cells.insert(0, nbformat.notebooknode.NotebookNode())
        nb.cells[0].cell_type = 'raw'
        nb.cells[0].metadata = {}
        nb.cells[0].source = metadata_to_header(title, authors, tags, tldr, created, updated, private)

        # make directory
        if not exists(post_folder):
            makedirs(post_folder)

    else:
        # existing knowledge post, fetch data from metadata
        created = datetime.strptime(nb.metadata.knowledge.created, '%Y-%m-%d %H:%M:%S')
        id = nb.metadata.knowledge.id
        post_path = nb.metadata.knowledge.post_path

    nb.metadata.knowledge.title = title
    nb.metadata.knowledge.authors = authors
    nb.metadata.knowledge.tags = tags
    nb.metadata.knowledge.tldr = tldr
    nb.metadata.knowledge.private = private
    nb.metadata.knowledge.created = created.strftime('%Y-%m-%d %H:%M:%S')
    nb.metadata.knowledge.updated = updated.strftime('%Y-%m-%d %H:%M:%S')
    nb.metadata.knowledge.path = path
    nb.metadata.knowledge.id = id
    nb.metadata.knowledge.post_path = post_path

    # write/overwrite post in database
    with open(post_path, 'w') as fp:
        nbformat.write(nb, fp)

    # write notebook to stash metadata
    with open(nb_path, 'w') as fp:
        # pop out header
        nb.cells.pop(0)
        nbformat.write(nb, fp)

    return kr.KnowledgePost.from_file(nb.metadata.knowledge.post_path)


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
