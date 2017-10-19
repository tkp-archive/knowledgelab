from setuptools import setup, find_packages
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

with open(path.join(here, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='knowledgelab',
    version='0.0.1',
    description='Knowledge Repo integration for JupyterLab',
    long_description=long_description,
    url='https://github.com/timkpaine/knowledgelab',
    download_url='https://github.com/timkpaine/knowledgelab/archive/v0.0.1.tar.gz',
    author='Tim Paine',
    author_email='t.paine154@gmail.com',
    license='LGPL',

    classifiers=[
        'Development Status :: 3 - Alpha',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
    ],

    keywords='analytics jupyter',

    packages=find_packages(exclude=['tests',]),
    zip_safe=False,

    # entry_points={
    #     'console_scripts': [
    #         'sample=sample:main',
    #     ],
    # },
)
