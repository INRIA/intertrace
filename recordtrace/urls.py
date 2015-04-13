from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import patterns, url

from recordtrace import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^trace$', views.trace, name='trace'),
    url(r'^projects$', views.projects, name='projects'),
    url(r'^temp_projects$', views.temp_projects, name='temp_projects'),
    url(r'^connections/(?P<session_doc_url>\S+)/$', views.connections, name='connections'),
    url(r'^unique_session_table/(?P<session_id>\S+)/$', views.unique_session_table, name='unique_session_table'),
    url(r'^unique_session/(?P<uuid>\S+)/(?P<proj_url>\S+)/$', views.unique_session, name='unique_session'),
    url(r'^session/(?P<uuid>\S+)/$', views.session, name='session'),
    #url(r'^session/(?P<session_id>\d+)/$', views.session, name='session'),
    url(r'^sessionvis/(?P<session_id>\d+)/$', views.sessionvis, name='sessionvis'),
    url(r'^json/(?P<session_id>\d+)/$', views.showJSON, name='json'),
    url(r'^projJSON/(?P<proj_url>\S+)/$', views.showProjJSON, name='projJSON'),
    url(r'^projCSV/(?P<proj_url>\S+)/$', views.showProjCSV, name='projCSV'),
    url(r'^csv/(?P<session_id>\d+)/$', views.showCSV, name='csv'),
    url(r'^sessionJSON/(?P<session_id>\d+)/$', views.sessionJSON, name='sessionJSON'),
    url(r'^sessionVJSON/(?P<uuid>\S+)/$', views.sessionVJSON, name='sessionVJSON'),
    url(r'^projDJSON/(?P<proj_url>\S+)/$', views.projJSON, name='projDJSON'),
    url(r'^projDCSV/(?P<proj_url>\S+)/$', views.projCSV, name='projDCSV'),
    url(r'^downloadCSV/(?P<session_id>\S+)/$', views.downloadCSV, name='downloadCSV'),
    url(r'^downloadFULLCSV/(?P<proj_url>\S+)/$', views.downloadFULLCSV, name='downloadFULLCSV'),
    url(r'^downloadJSON/(?P<session_id>\S+)/$', views.downloadJSON, name='downloadJSON'),
    url(r'^downloadFULLJSON/(?P<proj_url>\S+)/$', views.downloadFULLJSON, name='downloadFULLJSON'),
    url(r'^event/(?P<event_id>\d+)$', views.event, name='event'),
)
