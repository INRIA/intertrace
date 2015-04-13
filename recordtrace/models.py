from django.db import models

import base64


class Session(models.Model):
    session = models.CharField(max_length=200,db_index=True)
    date = models.DateTimeField(auto_now_add=True, db_index=True)
    doc_url = models.CharField(max_length=1024)
    browser = models.CharField(max_length=1024)
    def count_events(self):
        return Event.objects.filter(session = self.id).count()
    def count_people(self):
        return Session.objects.filter(doc_url = self.doc_url).values('session').distinct().count()

class Metadata(models.Model):
    session = models.ForeignKey(Session,db_index=True)
    key = models.CharField(max_length=200,db_index=True)
    value = models.CharField(max_length=1024)

class Event(models.Model):
    session = models.ForeignKey(Session,db_index=True)
    ts = models.BigIntegerField(db_index=True)
    category = models.CharField(max_length=200, db_index=True)
    action = models.TextField()
    label = models.TextField()
    value = models.TextField()

