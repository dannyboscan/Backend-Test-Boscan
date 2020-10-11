import re
from django.db.models import Q

FINDTERMS = re.compile(r'"([^"]+)"|(\S+)').findall
NORMSPACE = re.compile(r'\s{2,}').sub


def normalize_query(query_string, findterms=FINDTERMS, normspace=NORMSPACE):
    for t in findterms(query_string):
        yield normspace(' ', (t[0] or t[1]).strip())


def get_query(query_string, search_fields):
    query = None

    for term in normalize_query(query_string):
        or_query = None

        for field_name in search_fields:
            q = Q(**{"%s__icontains" % field_name: term})

            if or_query is None:
                or_query = q
            else:
                or_query |= q

        if query is None:
            query = or_query
        else:
            query &= or_query
    return query
