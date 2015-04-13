#!/bin/sh

here=`pwd`

sed < apache.conf.tmpl "s|/path/to/mysite.com|$here|" | \
 sed "s|/mysite|/intertrace|" > apache.conf
