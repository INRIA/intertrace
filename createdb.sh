mysql -u root -p <<EOF
CREATE DATABASE intertrace CHARACTER SET utf8;
GRANT USAGE ON *.* to intertrace@localhost IDENTIFIED BY 'intertrace';
GRANT ALL PRIVILEGES ON intertrace.* TO intertrace@localhost;
EOF
