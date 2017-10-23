import nbformat
import knowledge_repo as kr
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler


class SubmitKnowledgeHandler(IPythonHandler):
    def get(self):
        notebook = self.get_argument('notebook')
        try:
            with open(notebook, 'rb') as fp:
                nb = nbformat.read(fp, 4)
                repo = kr.KnowledgeRepository.for_uri('knowledgerepos')

        except:
            self.finish('File not found')
        else:
            self.finish(notebook)


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    route_pattern = url_path_join(web_app.settings['base_url'], '/kr/submit')
    print('Installing knowledgerepo handler on path %s', route_pattern)
    web_app.add_handlers(host_pattern, [(route_pattern, SubmitKnowledgeHandler)])
