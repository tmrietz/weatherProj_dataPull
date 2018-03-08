# weatherProj_dataPull
Modules for pulling data from NOAA API to use in larger weather data application

### Included:
-simple mysql db interface module for connecting, disconnenting, running queries, and some error handling
-operations for schema creation and deletion
-operations for inserting data
-NOAA API asynchronous, rate-limited request module to make calls via request-promises
-table-specific data parsing
-table specific data pulling drivers
