
# ipycmc

[![Build Status](https://travis-ci.org/MAAP-Project/ipycmc.svg?branch=master)](https://travis-ci.org/MAAP-Project/ipycmc)
[![codecov](https://codecov.io/gh/MAAP-Project/ipycmc/branch/master/graph/badge.svg)](https://codecov.io/gh/MAAP-Project/ipycmc)


A Jupyter Lab widget for the Common Mapping Client

## Installation

You can install using `pip`:

```bash
pip install ipycmc
```

Or if you use jupyterlab:

```bash
pip install ipycmc
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:
```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] ipycmc
```


## NOTES
`jupyter labextension install .`
`npm install --save-dev /Users/fplatt/Workspace/maap/common-mapping-client-jupyter`