from django import template
from django.template.defaultfilters import stringfilter

import base64

register = template.Library()

@register.filter
@stringfilter
def base64_encode(value):
    """Encode the value in base64"""
    return base64.b64encode(value)

@register.filter
@stringfilter
def base64_decode(value):
    """Dencode the value in base64"""
    return base64.b64decode(value)
    
