import ujson
from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from .commands import nb_to_kp


class SubmitKnowledgeHandler(IPythonHandler):
    def get(self):
        notebook = self.get_argument('notebook')
        self.finish(notebook)


class KnowledgePostHandler(IPythonHandler):
    def post(self):
        json = ujson.loads(self.request.body)
        notebook = json.pop('notebook')
        if not notebook or not json.get('title', None) or not json.get('authors', None) or not json.get('tags', None) or not json.get('tldr', None):
            self.set_status(401)
            self.finish('error')
            return
        kp = nb_to_kp(notebook, **json)
        print(kp)
        self.finish('test')


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    submit_route_pattern = url_path_join(web_app.settings['base_url'], '/knowledge/submit')
    post_route_pattern = url_path_join(web_app.settings['base_url'], '/knowledge/post')
    print('Installing knowledgerepo handler on path %s' % submit_route_pattern)
    print('Installing knowledgerepo handler on path %s' % post_route_pattern)
    web_app.add_handlers(host_pattern, [(submit_route_pattern, SubmitKnowledgeHandler)])
    web_app.add_handlers(host_pattern, [(post_route_pattern, KnowledgePostHandler)])
