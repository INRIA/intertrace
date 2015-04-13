from django.conf.urls import patterns, include, url
from recordtrace import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^recordtrace/', include('recordtrace.urls', namespace="recordtrace")),
    url(r'^trace', views.trace, name='trace'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login'),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout'),
    # Examples:
    # url(r'^intertrace/', include('intertrace.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
)
