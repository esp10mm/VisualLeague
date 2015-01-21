import sys
import time
import pymongo
import json

client = pymongo.MongoClient('localhost', 27017)
db = client.League
matches = db.matchTimeline.find()

relationTable = {}

with open('public/data/champion.json') as f:
    data = f.read()
staticData = json.loads(data)
staticData = staticData['data']
championTable = {}
for c in staticData:
    championTable[staticData[c]["id"]] = c
    relationTable[staticData[c]["id"]] = {'name':c, 'teammate':{}, 'enemy':{}}
    for c2 in staticData:
        relationTable[staticData[c]["id"]]['enemy'][staticData[c2]["id"]] = {'avgScore': 0, 'count':0, 'name':c2}
        relationTable[staticData[c]["id"]]['teammate'][staticData[c2]["id"]] = {'avgScore': 0, 'count':0, 'name':c2}



for m in matches:
    participants = m['participants']

    for p in participants:
        for p2 in participants:
            if p['teamId'] == p2['teamId'] and p['championId'] != p2['championId']:
                relationTable[p['championId']]['teammate'][p2['championId']]['count'] += 1
            elif p['championId'] != p2['championId']:
                relationTable[p['championId']]['enemy'][p2['championId']]['count'] += 1
    try:
        for frame in m['timeline']['frames']:
            if 'events' in frame:
                for event in frame['events']:
                    if event['eventType'] == 'CHAMPION_KILL':
                        score = 1
                        ratio = 1.0

                        killers = []

                        if event['killerId'] == 0:
                            continue

                        killers.append(participants[event['killerId'] - 1])
                        victim = participants[event['victimId'] - 1]

                        if 'assistingParticipantIds' in event:
                            for ass in event['assistingParticipantIds']:
                                killers.append(participants[ass-1])
                            ratio = ratio/len(killers)
                            for k in killers:
                                for k2 in killers:
                                    if k['championId'] != k2['championId']:
                                        relationTable[k['championId']]['teammate'][k2['championId']]['avgScore'] += score*ratio

                        for k in killers:
                            relationTable[k['championId']]['enemy'][victim['championId']]['avgScore'] += score*ratio
    except Exception, e:
        print m['matchId']

# print kills
for c in relationTable:
    champ = relationTable[c]
    enemy = champ['enemy']
    teammate = champ['teammate']
    for e in enemy:
        if enemy[e]['count'] != 0:
            enemy[e]['avgScore'] = enemy[e]['avgScore'] / enemy[e]['count']
    for t in teammate:
        if teammate[t]['count'] != 0:
            teammate[t]['avgScore'] = teammate[t]['avgScore'] / teammate[t]['count']

with open('public/data/relation.json', 'w') as outfile:
    json.dump(relationTable, outfile)
