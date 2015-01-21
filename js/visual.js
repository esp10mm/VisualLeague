var champColor = [
  "#000000", "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
  "#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
  "#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
  "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
  "#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
  "#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
  "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
  "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",
  "#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
  "#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
  "#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
  "#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
  "#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
  "#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800",
  "#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51",
  "#C895C5", "#320033", "#FF6832"
]

var roleColor = ["#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98"];

var roleTable = ["JUNGLE", "MIDDLE", "TOP", "SUPPORT", "CARRY"]


function matchDuration(rawdata, basetime, interval){
  var data = durationSort(rawdata, basetime, interval).value;
  var names = durationSort(rawdata, basetime, interval).names;

  var w = 950;
  var h = 300;
  var barPadding = 10;
  var padding = 50;
  var margin = {top: 20, right: 10, bottom: 20, left:10}

  var xPos = []
  var barW = w / data.length - barPadding

  for(var k in data){
    xPos.push(k*((w -padding)  / data.length) + 0.5*barW + padding);
  }

  var yScale = d3.scale.linear()
                 .domain([0, d3.max(data, function(d) { return d; })])
                 .range([h -margin.top - margin.bottom, 0]);

  var xScale = d3.scale.ordinal()
                 .domain(names)
                 .range(xPos)

  var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(5);

  var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(data.length);

  var svg = d3.select(".match.duration.chart")
              .append("svg")
              .attr("width", w)
              .attr("height", h);


  svg.selectAll("rect")
     .data(data)
     .enter()
     .append("rect")
     .attr("x", function(d, i) {
       return xPos[i] - 0.5*barW;
     })
     .attr("y",h - margin.top)
     .attr("fill", '#5F75E8')
     .attr("height", 0)
     .attr("width", 0)
     .transition()
     .delay(function(d, i) {
       return i * 100;
      })
     .duration(300)
     .attr("width", barW)
     .attr("y", function(d){
       return yScale(d) + margin.top;
     })
     .attr("height", function(d) {
       return h - yScale(d) - margin.top - margin.bottom;
     });

  var text = svg.selectAll("text")
     .data(data)
     .enter()
     .append("text")
     .attr("class", "barnum")
     .text(function(d) {
       return d;
     })
     .attr("x", function(d, i) {
       return xPos[i] - this.getBBox().width/2;
     })
     .attr("y",h - margin.top -1)
     .transition()
     .delay(function(d, i) {
       return i * 100;
     })
     .duration(300)
     .attr("y", function(d){
       return yScale(d) + margin.top - 1;
     })

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(" + padding + "," + margin.top +")")
     .call(yAxis);

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0," + (h - margin.bottom)+ ")")
     .call(xAxis);
}

function durationSort(rawdata, base, interval){
  var data = [0];
  for(var k in rawdata){
    var index = 0;

    if(rawdata[k] > base)
      index = Math.floor((rawdata[k] - base) / interval) + 1;

    if(data[index] == undefined){
      for(var i=data.length;i<=index;i++)
        data[i] = 0;
    }
    data[index] += 1
  }

  var i, count = 0;
  for(i = data.length-1; i >= 0; i--){
    count += data[i];
    if(i<20){
      break;
    }
  }

  data = data.slice(0, i);

  var names = [];
  for(var k in data){
    if(k == 0)
      names.push("<" + base/60)
    else if(k == (data.length-1))
      names.push(">"+ (base/60 + (k-1)* interval/60))
    else
      names.push((base/60 + (k-1) * interval/60) + "-" + (base/60 + k * interval/60));
  }

  var result = {};
  result.value = data;
  result.names = names;

  return result;
}

function durationReset(callback){
  var h = 280;
  var n = 0;

  d3.selectAll(".barnum")
    .each(function() { ++n; })
    .transition()
    .duration(500)
    .attr("y",h)
    .each("end", function(){
      if (!--n)
        callback();
    });

  d3.select(".match.duration.chart").selectAll("rect")
    .each(function() { ++n; })
    .transition()
    .duration(500)
    .attr("y",h)
    .attr("height", 0)
    .each("end", function(){
      if (!--n)
        callback();
    });
}

function summonerTier(rawdata){
  var width = 475,
  height = 300,
  radius = Math.min(width, height) / 2;

  data = [];
  var total = 0;
  var imghtml = ""
  for(var k in rawdata){
    data.push({"tier": k, "num":rawdata[k].num})
    total += rawdata[k].num;
    imghtml += "<img class='tier "+ k +" image' src='data/ranked/"+ k +"_I.jpg' style='display:none'></img>"
  }
  $('.tier.images').html(imghtml);


  var color = d3.scale.ordinal()
                .range(["#add097", "#c0dda1", "#94ae6d", "#b2c063", "#a8aa55", "#86bf7c", "#96b3a5", "#d7ac81"]);

  var hcolor = d3.scale.ordinal()
                .range(["#88b5a8", "#adcfbc", "#557154", "#919542", "#7d6926", "#3b9273", "#597ac4", "#dc6d7d"]);

  var arc = d3.svg.arc()
              .outerRadius(radius - 10)
              .innerRadius(radius - 70);

  var pie = d3.layout.pie()
              .sort(null)
              .value(function(d) { return d.num; });

  var svg = d3.select(".summoner.tier.chart").append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
             .data(pie(data))
             .enter().append("g")
             .attr("class", "arc");

  g.append("path")
   .attr("d", arc)
   .style("fill", function(d) { return color(d.data.tier); })
   .on("mouseover", function(d) {
     $('.tier.statistics').show();
     $('.tier.count.value').html(d.data.num);
     $('.tier.percent.value').html(Math.floor(d.data.num/total*100) + "%");
     $('.tier.image').hide();
     $('.'+d.data.tier+'.image').show();

     d3.select(this).style("fill", function(d){ return hcolor(d.data.tier)});
     $('.tier.header').text(d.data.tier);
   })
   .on("mouseout", function(d) {
     d3.select(this).style("fill", function(d) { return color(d.data.tier);});
   });

}

function scatterplotData(rawdata, x, y){
  metaTable = {
    "matchNum": "time played",
    "winrate": "winrate(%)",
    "avgKDA": "Average KDA",
    "avgDamage": "Average Damage",
    "avgDamageTaken": "Average Damage Taken"
  }

  data = [];
  for(var k in rawdata){
    rawdata[k].winrate = rawdata[k].winNum/rawdata[k].matchNum*100;

    var champ = {}
    champ.name = rawdata[k].name;
    champ["dx"] = rawdata[k][x];
    champ["dxmeta"] = metaTable[x];

    champ["dy"] = rawdata[k][y];
    champ["dymeta"] = metaTable[y];

    champ["mainRole"] = rawdata[k]['mainRole'];

    data.push(champ);
  }

  return data;
}

function scatterplotInit(rawdata, x, y, c){
  var w = 600;
  var h = 600;
  var barPadding = 10;
  var padding = 50;
  var margin = {top: 20, bottom: 20}

  var data = scatterplotData(rawdata, x, y);

  var xScale = d3.scale.linear()
                 .domain([d3.min(data, function(d){ return d.dx; }), d3.max(data, function(d) { return d.dx;})])
                 .range([0, w -padding*2]);

  var xAxis = d3.svg.axis()
                .tickFormat(function(d) {
                  if(x == 'winrate')
                    return d + "%"
                  var prefix = d3.formatPrefix(d);
                  return prefix.scale(d) + prefix.symbol;
                })
                .scale(xScale)
                .ticks(10);

  var yScale = d3.scale.linear()
                 .domain([d3.min(data, function(d){ return d.dy; }), d3.max(data, function(d) { return d.dy; })])
                 .range([h- margin.top*2, 0]);

  var yAxis = d3.svg.axis()
                .tickFormat(function(d) {
                  if(y == 'winrate')
                    return d + "%"
                  var prefix = d3.formatPrefix(d);
                  return prefix.scale(d) + prefix.symbol;
                })
                .orient("left")
                .scale(yScale)
                .ticks(10);

  var color = d3.scale.ordinal()
                .range(champColor);
  var rcolor = d3.scale.ordinal()
                 .range(roleColor);

  var svg = d3.select(".champions.scatterplot.chart")
              .append("svg")
              .attr("width", w)
              .attr("height", h);

  svg.selectAll("circle")
     .data(data)
     .enter()
     .append("circle")
     .attr("cx", function(d){
       return xScale(d.dx) + padding;
     })
     .attr("cy", function(d){
       return yScale(d.dy) + margin.top;
     })
     .attr("r", 8)
     .style("fill", function(d, i) { return color(i); })
     .on('mouseover', function(d){
       $('.champs.name').html('<h1 class="ui header">' + d.name + '</h2>');
       $('.champ.role.disp').html('<h1 class="ui header">' + d.mainRole + '</h2>');
       $('.champ.image').hide()
       $('.champ.image.'+d.name).show()
       $('.scatterplotX.show.value').text((Math.floor(d.dx*10)/10));
       $('.scatterplotY.show.value').text((Math.floor(d.dy*10)/10));
       $('.scatterplotX.show.label').text(d.dxmeta);
       $('.scatterplotY.show.label').text(d.dymeta);
       $('.champion.scatterplot.statistics').show();
     });

  svg.append("g")
     .attr("class", "xaxis")
     .attr("transform", "translate("+ padding +"," + (h - margin.bottom)+ ")")
     .call(xAxis);

  svg.append("g")
     .attr("class", "yaxis")
     .attr("transform", "translate("+ padding +"," + margin.top + ")")
     .call(yAxis);

}

function scatterplotUpdate(rawdata, x, y, c){
  var w = 600;
  var h = 600;
  var barPadding = 10;
  var padding = 50;
  var margin = {top: 20, bottom: 20}
  var data = scatterplotData(rawdata, x, y);

  var xScale = d3.scale.linear()
                 .domain([d3.min(data, function(d){ return d.dx; }), d3.max(data, function(d) { return d.dx;})])
                 .range([0, w -padding*2]);

  var xAxis = d3.svg.axis()
                .tickFormat(function(d) {
                  if(x == 'winrate')
                    return d + "%"
                  var prefix = d3.formatPrefix(d);
                  return prefix.scale(d) + prefix.symbol;
                })
                .scale(xScale)
                .ticks(10);

  var yScale = d3.scale.linear()
                 .domain([d3.min(data, function(d){ return d.dy; }), d3.max(data, function(d) { return d.dy; })])
                .range([h- margin.top*2, 0]);

  var yAxis = d3.svg.axis()
                .tickFormat(function(d) {
                  if(y == 'winrate')
                    return d + "%"
                  var prefix = d3.formatPrefix(d);
                  return prefix.scale(d) + prefix.symbol;
                })
                .orient("left")
                .scale(yScale)
                .ticks(10);

  var color = d3.scale.ordinal()
                .range(champColor);
  var rcolor = d3.scale.ordinal()
                .range(roleColor);

  var svg = d3.select('.champions.scatterplot.chart svg')


  svg.selectAll("circle")
     .data(data)
     .transition()
     .duration(500)
     .style("fill", function(d, i) {
       if(c == "mainRole"){
         return rcolor(roleTable.indexOf(d.mainRole));
       }
       else
         return color(i);
     })
     .attr("cx", function(d){
       return xScale(d.dx) + padding;
     })
     .attr("cy", function(d){
       return yScale(d.dy) + margin.top;
     })

  svg.selectAll(".yaxis")
     .transition()
     .duration(500)
     .call(yAxis);

  svg.selectAll(".xaxis")
     .transition()
     .duration(500)
     .call(xAxis);

}

function relationTableData(rawdata, ref){
  var data = {'list':[], 'nodes':[], 'tlinks':[], 'elinks':[]};
  for(var k in rawdata){
    var champ = rawdata[k];
    champ['id'] = k;
    champ['mainRole'] = ref.champs[k].mainRole;
    data.nodes.push(champ);
    data.list.push(k);
  }
  for(var i in rawdata){
    var champ = rawdata[i];
    for(var j in champ['teammate']){
      data.tlinks.push({'source':data.list.indexOf(i), 'target':data.list.indexOf(j), 'value':champ.teammate[j].avgScore, 'count':champ.teammate[j].count, 'srole':ref.champs[i].mainRole, 'trole':ref.champs[j].mainRole})
    }
    for(var j in champ['enemy']){
      data.elinks.push({'source':data.list.indexOf(i), 'target':data.list.indexOf(j), 'value':champ.enemy[j].avgScore - rawdata[j].enemy[i].avgScore, 'count':champ.enemy[j].count, 'srole':ref.champs[i].mainRole, 'trole':ref.champs[j].mainRole})
    }
  }
  return data;
}

function relationTable(rawdata, ref){

  var data = relationTableData(rawdata, ref);

  var margin = {top: 80, right: 0, bottom: 10, left: 80},
      w = 1100,
      h = 1100,
      n = data.nodes.length;

  var matrix = []

  data.nodes.forEach(function(c, i){
    matrix[i] = d3.range(n).map(function(j) { return {x: j, y: i, t: 1, tc:0, e:1, ec:0, sameLane:false}; });
  })

  data.tlinks.forEach(function(l, i){
    matrix[l.target][l.source].t = l.value;
    matrix[l.target][l.source].tc = l.count;
    matrix[l.target][l.source].xrole = l.srole;
    matrix[l.target][l.source].yrole = l.trole;
    if(l.srole == l.trole)
      matrix[l.target][l.source].sameLane = true;
    else if(l.srole == 'SUPPORT' && l.trole== 'CARRY')
      matrix[l.target][l.source].sameLane = true;
    else if(l.trole == 'SUPPORT' && l.srole== 'CARRY')
      matrix[l.target][l.source].sameLane = true;
  })

  data.elinks.forEach(function(l, i){
    matrix[l.target][l.source].e = l.value;
    matrix[l.target][l.source].ec = l.count;
  })

  var x = d3.scale.ordinal().rangeBands([0, w]);

  var orders = {
    name: d3.range(n).sort(function(a, b) { return d3.ascending(data.nodes[a].name, data.nodes[b].name); }),
    role: d3.range(n).sort(function(a, b) {
      if(roleTable.indexOf(data.nodes[a].mainRole) == roleTable.indexOf(data.nodes[b].mainRole))
        return d3.ascending(data.nodes[a].name, data.nodes[b].name);
      else
        return roleTable.indexOf(data.nodes[a].mainRole) - roleTable.indexOf(data.nodes[b].mainRole);
    })
  };

  // The default sort order.
  x.domain(orders.name);



  var svg = d3.select(".relation.table.chart").append("svg")
              .attr("width", w + margin.left + margin.right)
              .attr("height", h + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                var html = '<div class="ui tooltip segment">' +
                           '<div class="cellinfo img"><img class="ui rounded mini image" src="data/img/' + data.nodes[d.x].name + '_Square_0.jpg"></img>to' +
                           '<img class="ui rounded mini image" src="data/img/' + data.nodes[d.y].name + '_Square_0.jpg"></img></div>' +
                           '<div class="cellinfo"><h5 class="ui header">Same Team Matches: ' + d.tc +'</h5>' +
                           '<div class="cellinfo"><h5 class="ui header">Teamwork Score: ' + d.t.toFixed(2) +'</h5>' +
                           '<div class="cellinfo"><h5 class="ui header">Opposite Matches: ' + d.ec +'</h5>' +
                           '<div class="cellinfo"><h5 class="ui header">Threat Level: ' + d.e.toFixed(2) +'</h5>' +
                           '</div></div>';
                return html;
              })
  svg.call(tip);

  svg.append("rect")
     .attr("fill", '#eee')
     .attr("width", w)
     .attr("height", h);

  var row = svg.selectAll(".row")
               .data(matrix)
               .enter().append("g")
               .attr("class", "row")
               .attr("transform", function(d, i) {return "translate(0," + x(i) + ")"; })
               .each(row);

  row.append("line")
     .attr("x2", w);

  row.append("text")
     .attr("x", -6)
     .attr("y", x.rangeBand() / 2)
     .attr("dy", ".32em")
     .style("font-size",".32em")
     .attr("text-anchor", "end")
     .text(function(d, i) { return data.nodes[i].name; });

  var column = svg.selectAll(".column")
                  .data(matrix)
                  .enter().append("g")
                  .attr("class", "column")
                  .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

  column.append("line")
        .attr("x1", -w);

  column.append("text")
        .attr("x", 6)
        .attr("y", x.rangeBand() / 2)
        .attr("dy", ".32em")
        .style("font-size",".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return data.nodes[i].name; });

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
                 .data(row)
                //  .data(row.filter(function(d) {return d.z; }))
                 .enter().append("rect")
                 .attr("class", "cell")
                 .attr("x", function(d) {return x(d.x); })
                 .attr("width", x.rangeBand())
                 .attr("height", x.rangeBand())
                 .attr("fill", '#5F75E8')
                 .style("fill-opacity", function(d) {
                   t = d3.scale.linear().domain([d3.min(row, function(d){ return d.t;}), d3.max(row, function(d){ return d.t;})]).clamp(true);
                   return t(d.t);
                  })
                 .on('mouseover', tip.show)
                 .on('mouseout', tip.hide)
  }

}

function relationTableUpdate(control, rawdata, ref){
  var svg = d3.select(".relation.table.chart");

  rerange(function(){
    svg.selectAll('.row').each(update);
  });

  function update(row){
    var cell = d3.select(this).selectAll('.cell').transition().duration(2500)
                 .attr("fill", function(){
                   if(control.color == 'teamwork')
                     return '#5F75E8';
                   else
                     return '#EE2E24';
                 })
                 .style("fill-opacity", function(d) {
                   var te = 'e';

                   if(control.color =='teamwork')
                     te = 't';

                   var min = d3.min(row, function(d){return d[te];})

                   var max = d3.max(row, function(d){return d[te];})

                   var scale = d3.scale.linear().domain([min, max]).range([0.1, 1]).clamp(true);

                   if(control.sameLane && !d.sameLane)
                     return 0;
                   else if(d[te] == 0)
                     return 0;
                   else
                     return scale(d[te]);

                 });
  }

  function rerange(callback){
    if(control.order == 'none'){
      callback();
      return;
    }

    var w = 1100;
    var data = relationTableData(rawdata, ref)
    var n = data.nodes.length;
    var orders = {
      name: d3.range(n).sort(function(a, b) { return d3.ascending(data.nodes[a].name, data.nodes[b].name); }),
      role: d3.range(n).sort(function(a, b) {
        if(roleTable.indexOf(data.nodes[a].mainRole) == roleTable.indexOf(data.nodes[b].mainRole))
          return d3.ascending(data.nodes[a].name, data.nodes[b].name);
          else
            return roleTable.indexOf(data.nodes[a].mainRole) - roleTable.indexOf(data.nodes[b].mainRole);
        })
    };

    var x = d3.scale.ordinal().rangeBands([0, w]);

    x.domain(orders[control.order]);
    var t = svg.transition().duration(5000);

    var count = 0 ;
    t.selectAll(".row")
    .delay(function(d, i) { return x(i) * 4; })
    .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
    .selectAll(".cell")
    .delay(function(d) { return x(d.x) * 4; })
    .attr("x", function(d) { return x(d.x); })
    .each("end", function(){
      count +=1;
      if(count == n*n)
        callback();
    });;

    t.selectAll(".column")
    .delay(function(d, i) { return x(i) * 4; })
    .attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; })
    .each("end", function(){
      count +=1;
      if(count == n*n)
        callback();
    });

  }

}

function teamSimu(reldata){
  var champsHTML = "";
  $.getJSON( "data/champion.json", function( data ){
    var champs = [];
    for(var k in data.data)
      champs.push(data.data[k]);

    var order = d3.range(champs.length).sort(function(a, b) { return d3.ascending(champs[a].name, champs[b].name); })

    for(var k in order){
      var html = '<div class="dimmable image"> <div class="ui dimmer"><div class="content"><div class="center">' +
                 '<div class="ui inverted compact champSelect button" cindex='+ k +'>Add</div></div></div></div>' +
                 '<img class="ui rounded tiny champSelect image" src="data/img/' + champs[order[k]].key + '_Square_0.jpg"></div>';
      champsHTML += html;
    }
    $('.team.champSelect').html(champsHTML);

    var team1HTML = "";
    var team2HTML = "";
    for(var i=0; i<10; i++){
      if(i<5)
        // team1HTML += '<img class="ui tiny image team1 member'+i+'" src="data/img/Random_0.jpg"></img>';
        team1HTML += '<div class="dimmable image"> <div class="ui dimmer"><div class="content"><div class="center">' +
                     '<div class="ui inverted icon compact champRemove button empty team1 member'+i+'" champ="null" member='+i+'><i class="red large remove icon"></i></div></div></div></div>' +
                     '<img class="ui tiny image team1 member'+i+'" src="data/img/Random_0.jpg"></div>';
      else
        team2HTML += '<div class="dimmable image"> <div class="ui dimmer"><div class="content"><div class="center">' +
                     '<div class="ui inverted icon compact champRemove button empty team2 member'+i+'" champ="null" member='+i+'><i class="red large remove icon"></i></div></div></div></div>' +
                     '<img class="ui tiny image team2 member'+i+'" src="data/img/Random_0.jpg"></div>';
    }
    $('.team1.imgs').html(team1HTML);
    $('.team2.imgs').html(team2HTML);
    $('.dimmable.image').dimmer({on: 'hover'});

    $('.champSelect.button').on('click', function(){
      var cindex = order[$(this).attr('cindex')];
      if($('.empty').length>0){
        champSelectLeft = $('.empty').first().attr('member');
        $('.image.member'+champSelectLeft).attr('src', 'data/img/'+champs[cindex].key +'_Square_0.jpg');
        $('.button.member'+champSelectLeft).attr('champ', champs[cindex].id);
        $('.button.member'+champSelectLeft).removeClass('empty');
        updateScore();
      }
    })

    $('.champRemove.button').on('click', function(){
      if($(this).attr('champ') != null){
        var member = $(this).attr('member');
        $('.image.member'+member).attr('src', 'data/img/Random_0.jpg');
        $(this).attr('champ', "null");
        $(this).addClass('empty');
        champSelectLeft = $('.empty').first().attr('member');
        updateScore();
      }
    })

    function updateScore(){
      for(var i=1;i<3;i++){
        var e = 1;
        if(i==1)e=2;

        var teamworkScore = 0;
        var threatScore = 0;

        $('.champRemove.team'+i).each(function(firstC){
          if($(this).attr('champ') != "null"){
            var source = $(this).attr('champ');

            $('.champRemove.team'+i).each(function(secC){
              if($(this).attr('champ') != "null" && secC>firstC){
                var target = $(this).attr('champ');
                teamworkScore += reldata[source]['teammate'][target]['avgScore'];
              }
            })
          }
        })

        $('.champRemove.team'+i).each(function(firstC){
          if($(this).attr('champ') != "null"){
            var source = $(this).attr('champ');

            $('.champRemove.team'+e).each(function(secC){
              if($(this).attr('champ') != "null"){
                var target = $(this).attr('champ');
                threatScore += reldata[source]['enemy'][target]['avgScore'];
              }
            })
          }
        })

        $('.info.team'+i+' .teamwork.statistic .value').text(teamworkScore.toFixed(2));
        $('.info.team'+i+' .threat.statistic .value').text(threatScore.toFixed(2));
      }
    }
  });
}
