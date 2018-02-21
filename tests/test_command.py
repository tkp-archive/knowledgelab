import ujson
from datetime import datetime
from mock import patch, MagicMock


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

    def test_hash(self):
        from knowledgelab.commands import _gen_hash
        x = {'test': 'test2'}
        y = _gen_hash(x)
        assert y == hash(ujson.dumps(x))

    def test_repo(self):
        with patch('knowledge_repo.KnowledgeRepository.for_uri'), \
             patch('knowledge_repo.KnowledgeRepository.create_for_uri'), \
             patch('knowledgelab.commands.exists') as m:
            from knowledgelab.commands import repository

            m.return_value = False
            repository('test')
            m.return_value = True
            repository('test')

    def test_metadata_to_header(self):
        from knowledgelab.commands import metadata_to_header
        z = datetime.now()
        x = metadata_to_header('Test', ['authors'], ['tags'], 'tldr', z, z, False)
        y = ['---\n', 'title: Test\n', 'authors:\n', '- authors\n', 'tags:\n', '- tags\n', 'created_at: ' + z.strftime('%Y-%m-%d %H:%M:%S') + '\n', 'updated_at: ' + z.strftime('%Y-%m-%d %H:%M:%S') + '\n', 'tldr: tldr\n', 'private: False\n', '---']
        assert x == y

    def test_post(self):
        with patch('knowledge_repo.KnowledgePost.from_file'):
            from knowledgelab.commands import post
            x = MagicMock()
            x.has_post = MagicMock()
            x.has_post.return_value = True
            post(x, 'test')
            x.has_post.return_value = False
            post(x, 'test')

    def test_deploy(self):
        with patch('knowledgelab.commands.get_app_builder'), \
             patch('knowledgelab.commands.KnowledgeDeployer'):
            from knowledgelab.commands import deploy
            deploy('test')

    def test_nb_to_kb(self):
        with patch('nbformat.read') as m, \
             patch('nbformat.write'), \
             patch('knowledge_repo.KnowledgePost.from_file'), \
             patch('knowledgelab.commands.makedirs'), \
             patch('knowledgelab.commands.exists') as m2, \
             patch('knowledgelab.commands.metadata_to_header'), \
             patch('knowledgelab.commands.open'):

            from knowledgelab.commands import nb_to_kp
            m2.return_value = False
            nb_to_kp('test', title='test', authors=['authors'], tags=['tags'], tldr='tldr', private=False)

            m2.return_value = True
            m.return_value = MagicMock()

            class Test(dict):
                knowledge = MagicMock()

            m.return_value.metadata = Test()
            m.return_value.metadata['knowledge'] = MagicMock()
            m.return_value.metadata['knowledgelab'] = MagicMock()
            m.return_value.metadata.knowledge.created = '2017-01-01 00:00:00'

            nb_to_kp('test', title='test', authors=['authors'], tags=['tags'], tldr='tldr', private=False)
