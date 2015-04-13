# Interaction Trace Manager

Written by Jean-Daniel Fekete (Jean-Daniel.Fekete@inria.fr) and Jeremy
Boy (myjyby@gmail.com)

Intertrace is a log/trace manager for javascript programs on the web.
A simple library called trace.js can be imported in any HTML5 page to
send tracing events to a server. These trace events can be used to
debug, log, or collect information on what the user has done.

To install it, you need:

1. Python, tested with version 2.7.4+

2. MySQL

3. Fabric
   On Ubuntu, install with:
   ```
   sudo apt-get install python-pip python-dev build-essential
   sudo pip install fabric
   ```

4. Virtual Environment
    ```
    sudo pip install virtualenv
    ```

5. Change information in `intertrace/settings.py` to comply to your
   local environment.

6. Install the requirements for Django/interface

   Inside the `intertrace` directory, run:
    ```
    fab setup
    ```
    It will create the virtual environment, install the required
    libraries and create a secret key in your file
    `intertrace/settings.py`.

7. Create the mysql database

   Inside the `intertrace` directory, run:
   ```
   ./createdb.sh
   ```
   It asks for the root mysql password to create the 'intertrace'
   database with the right credentials.

8. Create the tables in the databse `intertrace`

   Inside the `intertrace` directory, run:
   ```
   fab migrate
   ```

9. Create an entry for a superuser in Django

   Inside the `intertrace` directory, run:
   ```
   fab create_superuser
   ```
   It will create an entry for a superuser in Django so that you can
   log in and create other users.

10. Run the development server and try the application

    Inside the `intertrace` directory, run:
    ```
    fab runserver
    ```
    
11. Open a web browser and connect to:
    ```
    http://localhost:8000/recordtrace/
    ```

    It should ask for your login/password (as entered in step 9) and
    show you a blank interface, since there is no trace yet

12. To test and create some simple traces, connect to:
    ```
    http://localhost:8000/static/recordtrace/test.html
    ```

    This test page will create some trace events that you will be able
    to read when opening again the interface at:
    ```
    http://localhost:8000/recordtrace/
    ```
13. To deploy on an apache2 server, take a look at the file
    `apache.conf.tmpl`. To create the configuration file for apache2,
    run the script:
    ```
    ./createconf.sh
    ```
    and copy/rename the file apache.conf as (for Ubuntu):
    `/etc/apache2/sites-enabled/intertrace.conf`

    Restart apache2, the site should be running. Check out the Django
    configuration file `setting.py` for specific settings, such as the
    name of the host, and debug mode.

