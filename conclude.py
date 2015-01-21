import sys
import time
import pymongo
import json

client = pymongo.MongoClient('localhost', 27017)
db = client.League
matches = db.matchTimeline.find()

with open('public/data/champion.json') as f:
    data = f.read()
staticData = json.loads(data)
staticData = staticData['data']
championTable = {}
for c in staticData:
    championTable[staticData[c]["id"]] = c

data = {'champs':{},'overview':{'num':0, 'duration':[],'tiers':{}}}
champs = data['champs']
overview = data['overview']
tiers = overview['tiers']

for m in matches:
    overview['num'] += 1
    overview['duration'].append(m['matchDuration'])


    for p in m['participants']:

        if p['highestAchievedSeasonTier'] not in tiers.keys():
            tiers[p['highestAchievedSeasonTier']] = {'num': 1};
        else:
            tiers[p['highestAchievedSeasonTier']]['num'] += 1;

        try:
            champ = champs[p['championId']]
        except KeyError:
            champs[p['championId']] = {}
            champ = champs[p['championId']]
            champ['id'] = p['championId']
            champ['matchNum'] = 0
            champ['winNum'] = 0
            champ['role'] = {}

            champ['role']['MIDDLE'] = 0
            champ['role']['CARRY'] = 0
            champ['role']['TOP'] = 0
            champ['role']['JUNGLE'] = 0
            champ['role']['SUPPORT'] = 0
            champ['mainRole'] = 'MIDDLE'

            champ['avgDamage'] = 0
            champ['avgDamageTaken'] = 0
            champ['avgKill'] = 0
            champ['avgDeath'] = 0
            champ['avgAssist'] = 0
            champ['avgKDA'] = 0

        champ['matchNum'] += 1

        if p['stats']['winner']:
            champ['winNum'] += 1

        if p['timeline']['role'] == 'DUO_SUPPORT':
            champ['role']['SUPPORT'] += 1
        elif p['timeline']['lane'] == 'BOTTOM':
            champ['role']['CARRY'] += 1
        else:
            champ['role'][p['timeline']['lane']] += 1

        champ['avgDamage'] += p['stats']['totalDamageDealtToChampions']
        champ['avgDamageTaken'] += p['stats']['totalDamageTaken']
        champ['avgKill'] += p['stats']['kills']
        champ['avgDeath'] += p['stats']['deaths']
        champ['avgAssist'] += p['stats']['assists']

# print data['champs'][40]
for ch in champs:
    champ = champs[ch]
    champ['name'] = championTable[ch]
    champ['avgDamage'] = champ['avgDamage'] / champ['matchNum']
    champ['avgDamageTaken'] = champ['avgDamageTaken'] / champ['matchNum']
    champ['avgKill'] = champ['avgKill'] / champ['matchNum']
    champ['avgDeath'] = champ['avgDeath'] / champ['matchNum']
    champ['avgAssist'] = champ['avgAssist'] / champ['matchNum']
    champ['avgKDA'] = (champ['avgAssist'] + champ['avgKill'])*1.0/champ['avgDeath']

    for r in champ['role']:
        if champ['role'][r] > champ['role'][champ['mainRole']]:
            champ['mainRole'] = r;


with open('public/data/data.json', 'w') as outfile:
    json.dump(data, outfile)
