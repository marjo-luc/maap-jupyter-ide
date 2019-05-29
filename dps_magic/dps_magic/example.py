#!/usr/bin/env python
# coding: utf-8

# Copyright (c) Elizabeth Yam.
# Distributed under the terms of the Modified BSD License.

"""
TODO: Add module docstring
"""

from ipywidgets import DOMWidget
from traitlets import Unicode
from ._frontend import module_name, module_version
from .hysds import HysdsMagic

# class ExampleWidget(DOMWidget):
#     """TODO: Add docstring here
#     """
#     _model_name = Unicode('ExampleModel').tag(sync=True)
#     _model_module = Unicode(module_name).tag(sync=True)
#     _model_module_version = Unicode(module_version).tag(sync=True)
#     _view_name = Unicode('ExampleView').tag(sync=True)
#     _view_module = Unicode(module_name).tag(sync=True)
#     _view_module_version = Unicode(module_version).tag(sync=True)

#     value = Unicode('Hello World').tag(sync=True)

# def load_ipython_extension(ipython):
# 	m = HysdsMagic()
# 	ipython.register_magics(m)
