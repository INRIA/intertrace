from django.conf.urls import include, url
from django.contrib.auth import views as auth_views
from recordtrace import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = [
    url(r'^recordtrace/', include('recordtrace.urls', namespace="recordtrace")),
    url(r'^trace', views.trace, name='trace'),
    url(r'^admin/', include(admin.site.urls)),
    #url('^', include('django.contrib.auth.urls')),
    url(r'^login/$', auth_views.login),
    #url(r'^accounts/logout/$', auth_views.logout),
    # Examples:
    # url(r'^intertrace/', include('intertrace.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
]
