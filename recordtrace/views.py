import json, logging, csv
import base64

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from django.template.defaultfilters import slugify

from recordtrace.models import Session, Event, Metadata

#from django.utils.six.moves import range
from django.http import StreamingHttpResponse



#logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
logger = logging.getLogger(__name__)


class Echo(object):
    #"""An object that implements just the write method of the file-like
    #interface.
    #"""
    def write(self, value):
        #"""Write the value by returning it, instead of storing in a buffer."""
        return value


# def sortAndUniq(input):
#   output = []
#   for x in input:
#     if x.doc_url not in output:
#       output.append(x)
#   output.sort()
#   return output




@login_required
def index(request):
    latest_session_list = Session.objects.all().order_by('-date')

    context = { 'sessions': latest_session_list }
    return render(request, 'recordtrace/index.html', context)

@login_required
def projects(request):
    projs = Session.objects.values('doc_url').distinct()

    for pr in projs:
        pr['people_count'] = Session.objects.filter(doc_url = pr['doc_url']).values('session').distinct().count()

    projs.order_by('-people_count')

    context = { 'sessions': projs }
    return render(request, 'recordtrace/project.html', context)

@login_required
def temp_projects(request):
    uuids = Session.objects.order_by('-date')

    paginator = Paginator(uuids, 25) # Show 25 contacts per page
    page = request.GET.get('page')
    try:
        sessions = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        sessions = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        sessions = paginator.page(paginator.num_pages)

    context = { 'sessions': sessions }
    return render(request, 'recordtrace/temp_page.html', context)



@login_required
def connections(request,session_doc_url):
    session_doc_url = base64.b64decode(session_doc_url)
    latest_session_list = Session.objects.filter(doc_url=session_doc_url).order_by('-date').values('session','id','doc_url')
    sessions_total = Session.objects.filter(doc_url=session_doc_url)

    for pr in latest_session_list:
        pr['count_sessions'] = Event.objects.filter(session_id = pr['id']).filter(action = 'browser').count()
        pr['count_events'] = Event.objects.filter(session__session = pr['session']).count()
        pr['user_events'] = Event.objects.filter(session__session = pr['session']).filter(category = '_user').count()
        pr['system_events'] = Event.objects.filter(session__session = pr['session']).filter(category = '_system').count()

    paginator = Paginator(latest_session_list, 25) # Show 25 contacts per page
    page = request.GET.get('page')
    try:
        sessions = paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        sessions = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        sessions = paginator.page(paginator.num_pages)
    # IF THE PAGINATOR IS NEEDED
    #context = { 'sessions': session, 'docurl': session_doc_url }
    context = { 'sessions': sessions, 'docurl': session_doc_url, 'vis_data': sessions_total }
    #context = { 'sessions': latest_session_list, 'docurl': session_doc_url, 'vis_data': sessions_total }
    return render(request, 'recordtrace/people.html', context)


@login_required
def session(request,uuid):
    session = Session.objects.get(session=uuid)
    latest_event_list = Event.objects.filter(session=session).order_by('ts')
    context = { 'session': session }
    return render(request, 'recordtrace/session.html', context)


#@login_required
#def unique_session(request,uuid):
#def session(request,uuid):
    #session = Session.objects.get(session=uuid)
    #latest_event_list = Event.objects.filter(session=session).order_by('ts')
    #context = { 'latest_event_list': latest_event_list, 'session': session}
    #return render(request, 'recordtrace/unique_session.html', context)
#    return HttpResponse("Hello, world. You're at the recordtrace session %s." % session_id)

@login_required
def unique_session(request,uuid,proj_url):
    proj_url = base64.b64decode(proj_url)
    session = Session.objects.get(session=uuid)
    latest_event_list = Event.objects.filter(session=session).order_by('ts')
    context = { 'latest_event_list': latest_event_list, 'session': session, "docurl": proj_url, "uuid": uuid }
    return render(request, 'recordtrace/unique_session.html', context)



@login_required
def all_connections(request):
    people = Session.objects.values('session').distinct()

    for pr in people:
        pr['people_count'] = Session.objects.filter(session = pr['session']).count()

    projs.order_by('-people_count')

    context = { 'sessions': projs }
    return render(request, 'recordtrace/project.html', context)




@login_required
def unique_session_table(request,session_id):
    session = Session.objects.get(id=session_id)
    context = { 'session': session }
    return render(request, 'recordtrace/unique_session_ref.html', context)


@login_required
def sessionvis(request,session_id):
    session = Session.objects.get(id=session_id)
    context = { 'session': session }
    return render(request, 'recordtrace/sessionvis.html', context)

@login_required
def showJSON(request,session_id):
    session = Session.objects.get(id=session_id)
    context = { 'session': session }
    return render(request, 'recordtrace/json.html', context)

@login_required
def showProjJSON(request,proj_url):
    session = Session.objects.filter(doc_url=proj_url)
    context = { 'sessions': session }
    return render(request, 'recordtrace/projJson.html', context)

@login_required
def showProjCSV(request,proj_url):
    session = Session.objects.filter(doc_url=proj_url)
    context = { 'sessions': session }
    return render(request, 'recordtrace/projCsv.html', context)




@login_required
def showCSV(request,session_id):
    session = Session.objects.get(id=session_id)
    context = { 'session': session }
    return render(request, 'recordtrace/csv.html', context)


@login_required
def sessionJSON(request,session_id):
    session = Session.objects.get(id=session_id)
    latest_event_list = Event.objects.filter(session=session).order_by('ts')
    out = [ { 'ts': o.ts, 'cat': o.category, 'action': o.action, 'label': o.label, 'value': o.value, 'uuid': o.session.session } for o in latest_event_list ]
    output = json.dumps(out)
    return HttpResponse(output, "content_type='text/json'")
#    context = { 'latest_event_list': latest_event_list, 'session': session}
#    return render(request, 'recordtrace/session.html', context)

@login_required
def sessionVJSON(request,uuid):
    session = Session.objects.get(session=uuid)
    latest_event_list = Event.objects.filter(session=session).order_by('ts')
    out = [ { 'ts': o.ts, 'cat': o.category, 'action': o.action, 'label': o.label, 'value': o.value, 'uuid': o.session.session } for o in latest_event_list ]
    output = json.dumps(out)
    return HttpResponse(output, "content_type='text/json'")
#    context = { 'latest_event_list': latest_event_list, 'session': session}
#    return render(request, 'recordtrace/session.html', context)




@login_required
def projJSON(request,proj_url):
    proj_url = base64.b64decode(proj_url)
    #session = Session.objects.filter(id=session_id)
    latest_event_list = Event.objects.filter(session__doc_url=proj_url).order_by('ts')
    out = [ { 'ts': o.ts, 'cat': o.category, 'action': o.action, 'label': o.label, 'value': o.value, 'uuid': o.session.session } for o in latest_event_list ]
    output = json.dumps(out)
    return HttpResponse(output, "content_type='text/json'")

@login_required
def projCSV(request,proj_url):
    #session = Session.objects.filter(id=session_id)
    latest_event_list = Event.objects.filter(session__doc_url=proj_url).order_by('ts')
    out = [ { 'ts': o.ts, 'cat': o.category, 'action': o.action, 'label': o.label, 'value': o.value, 'uuid': o.session.session } for o in latest_event_list ]
    output = json.dumps(out)
    return HttpResponse(output, "content_type='text/json'")

@login_required
def downloadCSV(request,session_id,fileds=None):
    session = Session.objects.get(id=session_id)
    latest_event_list = Event.objects.filter(session=session).order_by('ts')
    #context = { 'session': session }
    # Create the HttpResponse object with the appropriate CSV header.
    #response = HttpResponse(content_type='text/csv')
    #response['Content-Disposition'] = 'attachment; filename=user_%s.csv' % slugify(session_id)

    #writer = csv.writer(response)
    headers = ["user","uuid","ts","category","action","label","value"]
    #writer.writerow(headers)

    rows = []
    rows.append(headers)

    for obj in latest_event_list:
        row = []
        #for element in headers:
            #row.append(element)
        for field in headers:
            if field in headers:
                if field == "uuid":
                    val = getattr(obj.session, "session")
                elif field == "user":
                    val = getattr(obj.session, "id")
                else:
                    val = getattr(obj, field)
                    #print str(val).encode('utf-8')
                    if callable(val):
                        val = val()

                    #val = "Django"
                #val = str(val).encode("utf-8")                    
                #row.append(str(val).decode('utf-8'))
                row.append(val)
        rows.append(row)
        #writer.writerow([unicode(s).encode("utf-8") for s in row])
        #rows = ([unicode(s).encode("utf-8")] for s in row)
    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    response = StreamingHttpResponse((writer.writerow([unicode(s).encode("utf-8") for s in r]) for r in rows), content_type="text/csv")
    response['Content-Disposition'] = 'attachment; filename=user_%s.csv' % slugify(session_id)
    #writer.writerow(['Second row', 'A', 'B', 'C', '"Testing"', "Here's a quote"])

    # Return CSV file to browser as download
    return response

@login_required
def downloadJSON(request,session_id):
    session = Session.objects.get(id=session_id)
    latest_event_list = Event.objects.filter(session=session).order_by('ts')
    out = [ { 'user': o.session.id, 'ts': o.ts, 'category': o.category, 'action': o.action, 'label': o.label, 'value': o.value, 'uuid': o.session.session } for o in latest_event_list ]
    output = json.dumps(out)

    response = HttpResponse(content_type='application/json')
    response['Content-Disposition'] = 'attachment; filename=user_%s.json' % slugify(session_id)

    response.write(output)

    #return HttpResponse(output, "content_type='text/json'")
    return response
#    context = { 'latest_event_list': latest_event_list, 'session': session}
#    return render(request, 'recordtrace/session.html', context)




@login_required
def downloadFULLCSV(request,proj_url,fileds=None):
    proj_url = base64.b64decode(proj_url)
    sessions = Session.objects.filter(doc_url=proj_url).order_by('-date')
    latest_event_list = Event.objects.filter(session__in=sessions).order_by('ts')

    #response = HttpResponse(content_type='text/csv')
    #response['Content-Disposition'] = 'attachment; filename=project_full.csv' 

    #writer = csv.writer(response)
    headers = ["user","uuid","ts","category","action","label","value"]
    #writer.writerow(headers)

    rows = []
    rows.append(headers)

    for obj in latest_event_list:
            row = []
            for field in headers:
                if field in headers:
                    if field == "uuid":
                        val = getattr(obj.session, "session")
                    elif field == "user":
                        val = getattr(obj.session, "id")
                    else:
                        val = getattr(obj, field)
                        if callable(val):
                            val = val()
                    row.append(val)
            #writer.writerow([unicode(s).encode("utf-8") for s in row])
            rows.append(row)

    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)
    response = StreamingHttpResponse((writer.writerow([unicode(s).encode("utf-8") for s in r]) for r in rows), content_type="text/csv")
    response['Content-Disposition'] = 'attachment; filename=project_full.csv' 

    return response


@login_required
def downloadFULLJSON(request,proj_url):
    proj_url = base64.b64decode(proj_url)
    session = Session.objects.filter(doc_url=proj_url).order_by('-date')
    latest_event_list = Event.objects.filter(session__in=session).order_by('ts')

    out = [ { 'user': o.session.id, 'ts': o.ts, 'category': o.category, 'action': o.action, 'label': o.label, 'value': o.value, 'uuid': o.session.session } for o in latest_event_list ]
    
    output = json.dumps(out)

    response = HttpResponse(content_type='application/json')
    response['Content-Disposition'] = 'attachment; filename=project_full.json'

    response.write(output)

    return response





@login_required
def event(request,event_id):
    event = Event.objects.get(id=event_id)
    context = { 'event': event }
    return render(request, 'recordtrace/event.html', context)

#class EventView(generic.DetailView):
#    model = Event
#    template_name = 'recordtrace/event.html'

# def event(request,event_id):
#     return HttpResponse("Hello, world. You're at the recordtrace event %s." % event_id)

@csrf_exempt
def trace(request):
    logger.debug('Trace called with %s' % request.method)
    response = HttpResponse('ok', content_type='text/plain')
    response['Access-Control-Max-Age'] = '1000'  
    if 'HTTP_ORIGIN' in request.META:
        logger.debug('Origin: %s' % request.META['HTTP_ORIGIN'])
        response['Access-Control-Allow-Origin'] = request.META['HTTP_ORIGIN']
    else:
        response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
    if request.method == 'POST':
        logger.debug('Received POST')
        read_trace(request)
    elif request.method == 'GET':
        logger.debug('Invalid GET')
        return HttpResponse('Error', content_type="text/plain", status=400)
    return response
        
def read_trace(request):
    f = decode(request.body)
    logger.debug(f)
    if isinstance(f, dict):
        insert(f)
    elif isinstance(f, list):
        for f2 in f:
            insert(f2)

def decode(msg):
    if msg[0]=='{' or msg[0]=='[':
        logger.debug('Found json format')
        return json.loads(msg)
    logger.debug('Not json format')
    ret = {}
    fields = msg.split('&')
    for keyval in fields:
        kv=keyval.split('=')
        ret[kv[0]] = kv[1]
    return ret

def insert(f):
    session, create = Session.objects.get_or_create(session=f['session'])

    define(f, 'ts')
    define(f, 'label')
    define(f, 'value')
    event = Event(session=session, ts=f['ts'], category=f['cat'], action=f['action'], label=f['label'], value=f['value'])
    event.save()
    if event.category == "_trace":
        md = Metadata(session=session, key=event.action, value=event.value)
        md.save()
        if md.key == "document.location":
            session.doc_url = md.value
            session.save()
        elif md.key == "browser":
            session.browser = md.value
            session.save()

def define(fs, name):
    if name not in fs:
        fs[name] = ''
