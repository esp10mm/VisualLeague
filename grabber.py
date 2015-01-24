import urllib2
import urllib
import urlparse

import sys
import time
import pymongo
import json

client = pymongo.MongoClient('localhost', 27017)
db = client.League
workingQ = []
summonerQ = []

def url_fix(s, charset='utf-8'):
    if isinstance(s, unicode):
        s = s.encode(charset, 'ignore')
    scheme, netloc, path, qs, anchor = urlparse.urlsplit(s)
    path = urllib.quote(path, '/%')
    qs = urllib.quote_plus(qs, ':&=')
    return urlparse.urlunsplit((scheme, netloc, path, qs, anchor))

def getData(method, arg):
    arg = str(arg)
    methods = {
        'summoner': 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/' + arg + '?api_key=' + leagueKey,
        'recent': 'https://na.api.pvp.net/api/lol/na/v1.3/game/by-summoner/' + arg + '/recent?api_key=' + leagueKey,
        'match': 'https://na.api.pvp.net/api/lol/na/v2.2/match/' + arg + '?includeTimeline=true&api_key=' + leagueKey
    }
    url =  methods[method]
    url = url_fix(url);
    print 'GET: ' + url
    data = urllib2.urlopen(url).read()
    data = json.loads(data)
    return data

def addSummoner(name):
    summoner = getData('summoner', name)
    summoner = summoner[summoner.keys()[0]]
    sid = summoner['id']
    dbSummoner = db.summoner.find_one({"id": sid})
    if dbSummoner is None:
        db.summoner.save(summoner)
    elif dbSummoner['revisionDate'] == summoner['revisionDate']:
        return
    else:
        db.summoner.find_and_modify({'id': sid}, { '$set': { 'revisionDate': summoner['revisionDate']} })
    workingQ.append(('recent', sid))
    return

def addRecents(sid):
    recents = getData('recent', sid)
    games = recents['games']
    summoner = db.summoner.find_one({"id": sid})
    if 'games' not in summoner:
        summoner['games'] = []
    for g in games:
        if g['subType']=='RANKED_SOLO_5x5':
            workingQ.append(('match', g['gameId']))
            if g['gameId'] not in summoner['games']:
                summoner['games'].append(g['gameId'])
        if 'fellowPlayers' in g:
            for p in g['fellowPlayers']:
                if len(summonerQ) < 100:
                    summonerQ.append(('summoner', p['summonerId']))

    db.summoner.find_and_modify({"id": sid}, summoner)
    return

def addMatch(mid):
    if db.matchTimeline.find_one({"matchId": mid}) is None:
        match = getData('match', mid)
        db.matchTimeline.save(match)
    return

def work():
    global workingQ
    global summonerQ
    summonerQSet = list(set(summonerQ))
    removeNum = len(summonerQ)-len(summonerQSet)
    if removeNum > 0:
        print ('SummonerQ remove %d entry, current length: %d' % (removeNum, len(summonerQSet)) )
    summonerQ = summonerQSet

    if len(workingQ) < 1:
        workingQ.append(summonerQ[0])
        summonerQ.pop(0)
    time.sleep(0.8)

    task = workingQ[0]
    workingQ.pop(0)
    if task[0] == 'summoner':
        addSummoner(task[1])
    elif task[0] == 'recent':
        addRecents(task[1])
    elif task[0] == 'match':
        addMatch(task[1])

    return

config = open('config.json')
config = json.load(config)
leagueKey = config['leagueKey']
summonerSeed = config['summonerSeed']

summonerQ.append(('summoner', summonerSeed))
while True:
        try:
            if len(workingQ) > 0 or len(summonerQ) > 0:
                work()
            else:
                break
        except Exception, e:
            print 'ERROR !' + str(e)
            time.sleep(30)
            continue
