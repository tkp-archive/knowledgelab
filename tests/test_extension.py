import tornado.web
from mock import MagicMock


class TestConfig:
    def setup(self):
        pass
        # setup() before each test method

    def teardown(self):
        pass
        # teardown() after each test method

    @classmethod
    def setup_class(cls):
        pass
        # setup_class() before any methods in this class

    @classmethod
    def teardown_class(cls):
        pass
        # teardown_class() after any methods in this class

    def test_submit(self):
        from knowledgelab.extension import SubmitKnowledgeHandler
        s = SubmitKnowledgeHandler(tornado.web.Application(), MagicMock())
        s._transforms = []
        s.get()

    def test_post(self):
        from knowledgelab.extension import KnowledgePostHandler

        # TODO 401
        k = KnowledgePostHandler(tornado.web.Application(), MagicMock())
        k.request = MagicMock()
        k.request.body = ''
        k._transforms = []
        k.post()

        # TODO 401
        k = KnowledgePostHandler(tornado.web.Application(), MagicMock())
        k.request.body = '{}'
        k._transforms = []
        k.post()

        # TODO OK
        k = KnowledgePostHandler(tornado.web.Application(), MagicMock())
        k.request.body = '{"notebook":"test"}'
        k._transforms = []
        k.post()

    def test_load(self):
        from knowledgelab.extension import load_jupyter_server_extension
        x = MagicMock()
        x.web_app = MagicMock()
        x.web_app.settings = {'base_url': '/'}
        load_jupyter_server_extension(x)
