Visual League
=======
In this project we collected game data of League of Legend and use D3.js to visualize it.<br>
Besides, we analysised relation between champions, including threat level and teamwork level.The result was also visualized and you can view it in our demo site.

## Data Source:
+ [Riot Games API](https://developer.riotgames.com/)

## Collecting Data
You can use ``grabber.py`` to collect data from Riot Game API yourself, but remember to setup mongoDB on localhost first, and you should have Riot Game API key and set it in ``config.json``.<br>
If `grabber.py` doesn't start to download data, please change `summonerSeed` value in `config.json`, it should be a summoner ID, and you can search summoner ID through summoner name with Riot Game API too.

## Data Summary
``conlude.py`` and ``relation.py`` summarize data from mongoDB, and output JSON file in `public/data`.

## Demo Site:
http://esp10mm.github.io/VisualLeague/
