# Earthdata Search

## Finding data

To find data, open the Earthdata Search client using the `Data Search` tab on the toolbar. When the window
opens as a tab in jupyter, take the tour for instructions on how to use the platform to search for data.

![Open EDSC](./images/open_edsc.png)

To see what search parameters you have selected in your EDSC session, select
`View Selected Search Parameters` on the dropdown menu.

![Current search parameters](./images/current_search_params.png)

## Adding data to a notebook

Once you have selected the data that you want to work with, it's time to transfer that
information to a notebook. There are 2 options for this - you can either insert a search
query, or the results of that query (a list of links to the data) to your notebook.

To choose and insert, select an option in the dropdown menu:
![Paste search in notebook](./images/paste_search.png)

In order to run the search command, and make other helpful calls for interacting
with the data, you need to have the MAAP library ([maap-py](https://github.com/MAAP-Project/maap-py)) 
imported into your notebook. On the notebook toolbar there is a helpful button that will insert all 
the MAAP defaults.

![Insert MAAP Defaults](./images/add_defaults_to_notebook.png)


## Visualizing data in a notebook

To visualize this data, check out [ipycmc](./ipycmc.md).