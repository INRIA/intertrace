var margin = {top: 35, right: 20, bottom: 50, left: 20},
    //w = 1024 - margin.left - margin.right, 
    w = d3.select("table").node().getBoundingClientRect().width - 15,
    //h = 500 - margin.top - margin.bottom,
    x = d3.time.scale().range([0, w]),
    y = d3.scale.ordinal().rangeRoundBands([0, h]),
	_eventHeight = 300,
	_activityHeight = 50,
	h = _eventHeight + _activityHeight + margin.bottom*2,
    color = d3.scale.linear()
    	.range(["#999", "#ccc"]),
    _switch = false,
    _relative = true;

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);


var svg = d3.select("#viz").append("div")
    .attr("class", "chart")
    .append("svg:svg")
    //.style("width", w + margin.left + margin.right + "px")
    .style("width", w + "px")
    .style("height", h + margin.top + margin.bottom + "px")
    .append("svg:g")
    //.attr("transform", "translate(" + margin.left+", "+margin.top+")");
    .attr("transform", "translate(" + 0+", "+margin.top+")");


var defs = svg.append("defs");
var gradient = defs.append("linearGradient")
	.attr("id","grad")
	.attr("x1","0%")
	.attr("y1","0%")
	.attr("x2","0%")
	.attr("y2","100%");
gradient.append("stop")
	.attr("offset","0%")
	.style("stop-color","#EAEAEA")
	.style("stop-opacity",1);
gradient.append("stop")
	.attr("offset","100%")
	.style("stop-color","#F9F9F9")
	.style("stop-opacity",1);

// LINE CHART FOR ACTIVITY
var _activity_g = svg.append("g")
	.attr("transform","translate(" + [margin.left,0] + ")");

var _line_xSCALE = d3.time.scale()
    .range([0, w - margin.left - margin.right]);

var _line_ySCALE = d3.scale.linear()
    .range([_activityHeight, 0]);

var xAxis = d3.svg.axis()
    .scale(_line_xSCALE)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(_line_ySCALE)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return _line_xSCALE(d.date); })
    .y(function(d) { return _line_ySCALE(d.activity); });
    //.interpolate("monotone")
    //.tension(0.9);

// TABLE FOR EVENTS
var _event_g = svg.append("g")
	.attr("transform","translate(" + [-1,_activityHeight + margin.bottom + margin.top] + ")");

/*function setProgress(){
	console.log(d3.event.loaded)
    var i = d3.interpolate(progress, d3.event.loaded / total);
    d3.transition().tween("progress", function() {
        return function(t) {
            progress = i(t);
            foreground.attr("d", arc.endAngle(twoPi * progress));
            text.text(formatPercent(progress));
        };
    });
}*/

function visualizeSession(data) {
	visualizeActivity(data);
	visualizeEvents(data);
	return null;
}

function visualizeEvents(data){
	// REMOVE THE LOADER
	d3.select(".progress-meter").remove();
	d3.selectAll(".cat").remove();
	svg.selectAll(".end-point").remove();
	_relative = true;

	// ADD THE CONTOUR
	/*_event_g.append("path")
		.attr("d","M" + [0,0.5] + " L" + [0,_eventHeight+0.5] + " L" + [w,_eventHeight+0.5] + " L" + [w,0.5] + " Z")
		.attr("class","contour")
		.style("fill","none")
		.style("stroke","#000");*/

	// FIT THE TIME SCALES FOR PATTERN DETECTION
	var _nestTime = data.slice(0),
		_nestTime = d3.nest()
			.key(function(d){ return d.uuid; })
			.entries(_nestTime),
		_totalTimes = new Array();

	_nestTime.forEach(function(d){
		// GET TOTAL TIME
		var _vals = d.values;
		_vals.sort(function(a,b){ return a.ts - b.ts });
		/*var _totalTime = _vals[_vals.length-1].ts - _vals[0].ts;
		_totalTimes.push(_totalTime);*/

		//var _initTime = d3.min(_vals,function(c){ return c.ts });
		var _initTime = _vals[0].ts,
			_session = 0,
			_tempHold = _vals[0].ts;

		// SET RELATIVE TIME
		_vals.forEach(function(c){
			if(d.cat === "_trace" && d.action === "browser"){
			//if(c.cat === "_trace"){
				//if(c.ts >= _tempHold + 250){
					_initTime = c.ts;
					_tempHold = c.ts;
					_session += 1;
				//};
			};

			c.relts = c.ts - _initTime;
			c.sessionID = _session;
			//if(c.cat === "_trace" && c.uuid === "1cc607f5-6716-4ada-a9ba-fa31996751ad") console.log([c.uuid,c.action,c.relts,c.ts,c.sessionID])
			return null;
		});
		return null;
	});

	var _nestSessions = d3.nest()
		.key(function(d){ return d.uuid; })
		.key(function(d){ return d.sessionID; })
		.entries(data);

	_nestSessions.forEach(function(d){
		var _vals = d.values;
		var _max = d3.max(_vals,function(c){ return d3.max(c.values,function(g){ return g.relts }) });
		
		_totalTimes.push(_max);
		return null;
	})

	var _maxTime = d3.max(_totalTimes);

	var _timeScale = d3.scale.linear()
		.range([0,_maxTime]);

	_nestSessions.forEach(function(d){
		var _vals = d.values;
			//_localMax = d3.max(_vals,function(c){ return d3.max(c.values,function(g){ return g.relts }) });
		//_timeScale.domain([0,_localMax]);

		_vals.forEach(function(c){
			var _svals = c.values,
				_localMax = d3.max(_svals,function(d){ return d.relts });

			if(_localMax > 250){	
				_timeScale.domain([0,_localMax]);

				_svals.forEach(function(g){
					g.relts = _timeScale(g.relts);

					/*_ssvals.forEach(function(f){
						f.relts = _timeScale(f.relts);
						return null;
					});*/
					return null;
				});
			}else{
				_svals.forEach(function(g){
					g.relts = 0;
					return null;
				});
			}
			//c.relts = _timeScale(c.relts);
			return null;
		});
		return null;
	});

	// GENERATE NEW DATASET WITH TEH MODIFIED TIME STAMPS
	var _newData = new Array();
	_nestTime.forEach(function(d){
		_vals = d.values;
		_vals.forEach(function(c){
			_newData.push(c)
		});
	});

	//console.log(_nestSessions)
	//console.log(_newData)
	// FIT THE BANDS
	var _nestCat = d3.nest()
			.key(function(d){ return d.cat })
			.entries(_newData),
		_nestAction = d3.nest()
			.key(function(d){ return d.action })
			.entries(_newData),
		_nestLabel = d3.nest()
			.key(function(d){ return d.label })
			.entries(_newData),
		_nestBands = d3.nest()
			.key(function(d){ return d.cat })
			.key(function(d){ return d.action })
			.key(function(d){ return d.label })
			.entries(_newData),
		_totalBands = new Object();

	_totalBands[0] = _nestCat.length;
	_totalBands[1] = _nestAction.length;
	_totalBands[2] = _nestLabel.length;


	var _catHeight = Math.round(_eventHeight / _totalBands[0]);

	var _catWidth = 100,
		_actionWidth = 100,
		_labelWidth = 100,
		_pointsWidth = w - _catWidth - _actionWidth - 1,
		_pointWidth = 2;

	// SET THE SCALE FOR THE EVENTS
	var _xScale = d3.scale.linear()
		.range([_labelWidth,_pointsWidth])
		.domain([0,_maxTime]);
	// SET THE NUMBER OF COLORS
	color.domain([0,_nestBands.length])

	var _catBand = _event_g.selectAll("g.cat")
		.data(_nestBands);
	_catBand.enter()
		.append("g")
		.attr("class","cat")
		.attr("transform",function(d,i){
			return "translate(" + [0.5,i * _catHeight + 0.5] + ")";
		});

	_catBand.append("rect")
		.attr("class",function(d){
			return "cat-bg " + d.key.replace(/\W/g, '').toLowerCase();
		})
		.attr("width",_catWidth)
		.attr("height",_catHeight)
		.style("fill",function(d,i){
			//return "url(#grad)";
			return "#FFF";
			//return color(i);
		});

	/*_catBand.append("line")
		.attr("x1",0)
		.attr("y1",-1)
		.attr("x2",w)
		.attr("y2",-1)
		.style("stroke-width",2)
		.style("stroke","#3D3D3D")*/

	_catBand.append("foreignObject")
		.attr("width",_catWidth)
		.attr("height",_catHeight)
		.append("xhtml:body")
		.attr("class","f-object-body")
		.style("height",_catHeight + "px")
		.style("background-color","#333")
		.append("p")
		.html(function(d){
			return d.key;
		})
		.attr("title",function(d){ return d.key })
		.style("font-size","11px");

	/*_catBand.append("text")
		.text(function(d){
			return d.key;
		})
		.style("font-size",11)
		.attr("dy",10);*/

	_catBand.each(function(d){
		var _length = d.values.length;

		var _actions = d3.select(this).selectAll("g.action")
			.data(d.values);

		_actions.enter()
			.append("g")
			.attr("class","action")
			.attr("transform",function(c,i){
				return "translate(" + [_actionWidth,i * _catHeight / _length] + ")"
			});
			
		_actions.append("rect")
			.attr("class",function(d){
				return "action-bg " + d.key.replace(/\W/g, '').toLowerCase();
			})
			.attr("width",_actionWidth)
			.attr("height",function(d){
				return _catHeight / _length;
			})
			.style("fill",function(d,i){
				//return "url(#grad)";
				return "#FFF";
				/*var _parentColor = d3.select(this.parentNode.parentNode).select(".cat-bg")
					.style("fill");
				return d3.rgb(_parentColor).brighter((i) / _length)*/
			});

		/*_actions.append("text")
			.text(function(d){
				return d.key;
			})
			.style("font-size",11)
			.attr("dy",10);*/
		_actions.append("foreignObject")
			.attr("width",_actionWidth)
			.attr("height",function(d){
				return _catHeight / _length;
			})
			.append("xhtml:body")
			.attr("class","f-object-body")
			.style("height",function(d){
				return _catHeight / _length + "px";
			})
			.style("background-color","#444")
			.append("p")
			.html(function(d){
				return d.key;
			})
			.attr("title",function(d){ return d.key })
			.style("font-size","11px");

		_actions.each(function(g){
			var _slength = g.values.length;

			var _labels = d3.select(this).selectAll("g.lbl")
				.data(g.values);

			_labels.enter()
				.append("g")
				.attr("class",function(d){
					return "lbl " + d.key.replace(/\W/g, '').toLowerCase();
				})
				.attr("transform",function(c,i){
					return "translate(" + [_actionWidth,i * _catHeight / _length / _slength] + ")"
				});
				//.call(zoom);
				
			_labels.append("rect")
				.attr("class",function(d){
					return "lbl-bg " + d.key.replace(/\W/g, '').toLowerCase();
				})
				.attr("width",_labelWidth + _pointsWidth)
				.attr("height",function(d){
					return _catHeight / _length / _slength;
				})
				//.style("stroke","#222")
				//.style("stroke-width",0.5)
				.style("fill",function(d,i){
					//return "url(#grad)";
					return "#FFF";
					/*var _parentColor = d3.select(this.parentNode.parentNode).select(".action-bg")
						.style("fill");
					return d3.rgb(_parentColor).brighter((i) / _slength)*/
				});

			/*_labels.append("text")
				.text(function(d){
					return d.key;
				})
				.style("font-size",11)
				.attr("dy",10);*/
			_labels.append("line")
				.attr("x1",_labelWidth)
				.attr("y1",0.5)
				.attr("x2",_labelWidth + _pointsWidth)
				.attr("y2",0.5)
				.style("stroke","#CCC")
				.style("stroke-width",0.5);

			_labels.append("foreignObject")
				.attr("width",_labelWidth)
				.attr("height",function(d){
					return _catHeight / _length / _slength;
				})
				.append("xhtml:body")
				.attr("class","f-object-body")
				.style("height",function(d){
					return _catHeight / _length / _slength + "px";
				})
				.style("background-color","#555")
				.append("p")
				.html(function(d){
					return d.key;
				})
				.attr("title",function(d){ return d.key })
				.style("font-size","11px");

			_labels.each(function(f){
				var _pointHeight = d3.select(this).select("rect.lbl-bg").attr("height");

				var _points = d3.select(this).selectAll("g.g-point")
					.data(f.values);

				_points.enter()
					.append("g")
					.attr("class","g-point");

				_points.append("rect")
					.attr("class",function(d){
						return "point u-" + d.uuid.replace(/\W/g, '').toLowerCase() + " s-" + d.sessionID;
					})
					.attr("height",_pointHeight)
					.attr("width",_pointWidth)
					.attr("x",function(d){
						return _xScale(d.relts)
					})
					.style("opacity",0.5)
					/*.on("mouseover",function(d){
						console.log(d)
					});*/


				return null;
			});
			return null;
		});
		return null;
	});

	if(_switch === false){
		_event_g.append("text")
			.text("Traces")
			.attr("x",0)
			.attr("y",-margin.top)
			.attr("dy",18)
			.style("font-size","14px");

		_event_g.append("line")
			.attr("x1",0)
			.attr("y1",_eventHeight + margin.bottom + 0.5)
			.attr("x2",w)
			.attr("y2",_eventHeight + margin.bottom + 0.5)
			.style("stroke","#DDD");

		_event_g.append("foreignObject")
			.attr("width",w - _catWidth - _actionWidth - _labelWidth)
			.attr("height",margin.bottom)
			.attr("y",_eventHeight)
			.attr("x",_catWidth + _actionWidth + _labelWidth)
			.append("xhtml:body")
			.attr("class","legend")
			.append("p");

		var _btn_group = svg.append("foreignObject")
			.attr("width",w - _catWidth - _actionWidth - _labelWidth)
			.attr("height",margin.bottom)
			.attr("y",_activityHeight + margin.bottom)
			.attr("x",w-185)
			.append("xhtml:body")
			.attr("class","buton-group")
			.append("div")
			.attr("class","btn-group");

		_btn_group.append("button")
			.attr("class","btn disabled btn-small")
			.html("Relative time")
			.on("mouseup",function(){
				visualizeEvents(data);
				d3.selectAll(".disabled")
					.classed("disabled",false);
				d3.select(this).classed("disabled",true);
				_switch = true;
				return null;
			});
		_btn_group.append("button")
			.attr("class","btn btn-small")
			.html("Absolute time")
			.on("mouseup",function(){
				visualizeAbsoluteEvents(data);
				d3.selectAll(".disabled")
					.classed("disabled",false);
				d3.select(this).classed("disabled",true);
				_switch = true;
				return null;
			});
	};
};

function zoomed() {
	d3.selectAll("g.g-point").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function visualizeActivity(data){
	
	// SET THE DATA
	//data.sort(function(a,b){ return b.ts-a.ts });

	var _nest = d3.nest()
		.key(function(d){ return d.uuid })
		.sortKeys(function(a,b){ return b.ts-a.ts })
		.entries(data);

	var _connections = new Array(),
		_parseDate = d3.time.format("%d-%b-%Y").parse;

	_nest.forEach(function(d){
		_connections.push({ uuid: d.key, ts: d3.min(d.values,function(c){  return c.ts }) });
		return null;
	});


	function getAllDays() {
	    //var s = new Date(d3.min(_connections,function(d){ return d.ts; }) - 0);
	    //var e = new Date(d3.max(_connections,function(d){ return d.ts; }) - 0);
	    var s = new Date(d3.min(_connections,function(d){ return d.ts; }) - 24 * 3600 * 1000 * 7 - 1);
	    var e = new Date(d3.max(_connections,function(d){ return d.ts; }) + 24 * 3600 * 1000 * 7 - 1);

	    var a = [];
	    
	    while(s < e) {
	        a.push(s.getTime());
	        s = new Date(s.setDate(
	            s.getDate() + 1
	        ))
	    }
	    
	    return a;
	};

	var _interpolateDATES = getAllDays();

	var _connectionDATES = new Array();

	_connections.forEach(function(d){
		_connectionDATES.push(timeConverter(d.ts));
		return null;
	});

	// COUNT ACTIVITY
	var counts = {};
	_connectionDATES.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });


	var _vector_key = d3.keys(counts),
		_vector_vals = d3.values(counts);

	var _newData = new Array();
	_vector_key.forEach(function(d,i){
		_newData.push({ date: _parseDate(d), activity: +_vector_vals[i] });
		return null;
	});

	_interpolateDATES.forEach(function(d){
		var _strDATE = timeConverter(d);
		if(_vector_key.indexOf(_strDATE) === -1){
			_newData.push({ date: _parseDate(_strDATE), activity: 0 });
		}
		return null;
	})

	// DRAW THE CHART
	_line_xSCALE.domain(d3.extent(_newData, function(d) { return d.date; }));
	_line_ySCALE.domain(d3.extent(_newData, function(d) { return d.activity; }));

	yAxis.tickFormat(d3.format("d"))
    .ticks(_newData.length - 1)

	_newData.sort(function(a,b){ return new Date(a.date) - new Date(b.date) });

	_activity_g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(-0.5," + (+_activityHeight+0.5) + ")")
		.call(xAxis);

	_activity_g.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(-0.5,0.5)")
		.call(yAxis);
		/*.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Sessions");*/

	_activity_g.append("path")
		.datum(_newData)
		.attr("class", "activity-line")
		.attr("d", line)
		.attr("transform", "translate(-0.5,0.5)");

	_activity_g.selectAll("circle")
		.data(_newData)
		.enter()
		.append("circle")
		.attr("r",4)
		.attr("cx",function(d){
			return _line_xSCALE(d.date)
		})
		.attr("cy",function(d){
			return _line_ySCALE(d.activity)
		})
		.attr("fill",function(){
			var _color = d3.select(".activity-line").style("stroke");
			return _color;
		})
		.on("mouseover",function(d){
			d3.select(this)
				.style("stroke","#333")
				.style("stroke-width",2);

			var _pos = d3.mouse(svg.node()),
				_x = _pos[0],
				_y = _pos[1];
			
			svg.append("text")
				.attr("class","activity-tooltip")
				.attr("x",_x + 5)
				.attr("y",_y - 8)
				.text(readableTime(d.date) + "—Sessions: " + d.activity)
            	.attr("text-anchor",function(){
            		if(_x > w/2){
            			return "end";
            		}else{
            			return "start";
            		};
            	})
            	.style("font-size","12px");


		})
		.on("mousemove",function(d){
			var _pos = d3.mouse(svg.node()),
				_x = _pos[0],
				_y = _pos[1];
			svg.select(".activity-tooltip")
				.attr("x",_x + 5)
				.attr("y",_y - 8);
		})
		.on("mouseout",function(d){
			d3.select(this)
				.style("stroke",null)
				.style("stroke-width",null);

			d3.selectAll(".activity-tooltip").remove();
		})

	_activity_g.append("line")
		.attr("x1",-margin.left)
		.attr("y1",0.5 - margin.top)
		.attr("x2",w)
		.attr("y2",0.5 - margin.top)
		.style("stroke","#DDD");

	_activity_g.append("text")
		.text("Activity")
		.attr("x",-margin.left)
		.attr("y",-margin.top)
		.attr("dy",18)
		.style("font-size","14px");

	_activity_g.append("line")
		.attr("x1",-margin.left)
		.attr("y1",_activityHeight + margin.bottom + 0.5)
		.attr("x2",w)
		.attr("y2",_activityHeight + margin.bottom + 0.5)
		.style("stroke","#DDD")

	return null;
};


// FOR THE ABSOLUE SCALE
function visualizeAbsoluteEvents(data){
	// REMOVE THE LOADER
	d3.select(".progress-meter").remove();
	d3.selectAll(".cat").remove();
	_relative = false;

	// FIT THE TIME SCALES FOR PATTERN DETECTION
	var _nestTime = data.slice(0),
		_nestTime = d3.nest()
			.key(function(d){ return d.uuid; })
			.entries(_nestTime),
		_totalTimes = new Array(),
		_minTimes = new Array();



	_nestTime.forEach(function(d){
		// GET TOTAL TIME
		var _vals = d.values;
		_vals.sort(function(a,b){ return a.ts - b.ts });
		/*var _totalTime = d3.max(_vals,function(c){ return c.ts }) - d3.min(data,function(c){ return c.ts });
		var _miniTime = d3.min(_vals,function(c){ return c.ts });
		_totalTimes.push(_totalTime);*/
		//var _totalTime = _vals[_vals.length-1].ts - _vals[0].ts;
		//_totalTimes.push(_totalTime);

		//_minTimes.push(_miniTime);

		//var _initTime = d3.min(_vals,function(c){ return c.ts });
		var _initTime = _vals[0].ts,
			_session = 0,
			_tempHold = _vals[0].ts;

		// SET RELATIVE TIME
		_vals.forEach(function(c){
			if(d.cat === "_trace" && d.action === "browser"){
			//if(c.cat === "_trace"){
				//if(c.ts >= _tempHold + 250){
					_initTime = c.ts;
					_tempHold = c.ts;
					_session += 1;
				//};
				
			};
			c.relts = c.ts - _initTime;
			c.sessionID = _session;
			return null;
		});
		return null;
	});

	var _nestSessions = d3.nest()
		.key(function(d){ return d.uuid; })
		.key(function(d){ return d.sessionID; })
		.entries(data);

	_nestSessions.forEach(function(d){
		var _vals = d.values;
		var _max = d3.max(_vals,function(c){ return d3.max(c.values,function(g){ return g.relts }) });
		
		_totalTimes.push(_max);
		return null;
	})

	var _maxTime = d3.max(_totalTimes);


	/*_nestTime.forEach(function(d){
		var _vals = d.values;
		_vals.forEach(function(c){
			c.relts = c.ts-_minTime;
			console.log(c.relts)
		});
	});*/

	// GENERATE NEW DATASET WITH TEH MODIFIED TIME STAMPS
	var _newData = new Array();
	_nestTime.forEach(function(d){
		_vals = d.values;
		_vals.forEach(function(c){
			_newData.push(c)
		});
	});


	// FIT THE BANDS
	var _nestCat = d3.nest()
			.key(function(d){ return d.cat })
			.entries(_newData),
		_nestAction = d3.nest()
			.key(function(d){ return d.action })
			.entries(_newData),
		_nestLabel = d3.nest()
			.key(function(d){ return d.label })
			.entries(_newData),
		_nestBands = d3.nest()
			.key(function(d){ return d.cat })
			.key(function(d){ return d.action })
			.key(function(d){ return d.label })
			.entries(_newData),
		_totalBands = new Object();

	_totalBands[0] = _nestCat.length;
	_totalBands[1] = _nestAction.length;
	_totalBands[2] = _nestLabel.length;

	// GET THE LAST EVENTS TO ADD BANDS TO MARK END OF SESSION
	var _lastBands = new Array();
	_nestSessions.forEach(function(d,i){
		var _vals = d.values;
		_vals.forEach(function(c){
			var _svals = c.values,
				_l = _svals.length - 1,
				_last_evt = _svals[_l];
			_lastBands.push(_last_evt);
			return null;
		});
		return null;
	});



	var _catHeight = Math.round(_eventHeight / _totalBands[0]);

	var _catWidth = 100,
		_actionWidth = 100,
		_labelWidth = 100,
		_pointsWidth = w - _catWidth - _actionWidth - 1,
		_pointWidth = 2;

	// SET THE SCALE FOR THE EVENTS
	var _xScale = d3.scale.linear()
		.range([_labelWidth,_pointsWidth])
		.domain([0,_maxTime]);
	// SET THE NUMBER OF COLORS
	color.domain([0,_nestBands.length])

	var _catBand = _event_g.selectAll("g.cat")
		.data(_nestBands);
	_catBand.enter()
		.append("g")
		.attr("class","cat")
		.attr("transform",function(d,i){
			return "translate(" + [0.5,i * _catHeight + 0.5] + ")";
		});

	_catBand.append("rect")
		.attr("class",function(d){
			return "cat-bg " + d.key.replace(/\W/g, '').toLowerCase();
		})
		.attr("width",_catWidth)
		.attr("height",_catHeight)
		.style("fill",function(d,i){
			//return "url(#grad)";
			return "#FFF";
			//return color(i);
		});

	_catBand.append("foreignObject")
		.attr("width",_catWidth)
		.attr("height",_catHeight)
		.append("xhtml:body")
		.attr("class","f-object-body")
		.style("height",_catHeight + "px")
		.style("background-color","#333")
		.append("p")
		.html(function(d){
			return d.key;
		})
		.attr("title",function(d){ return d.key })
		.style("font-size","11px");


	_catBand.each(function(d){
		var _length = d.values.length;

		var _actions = d3.select(this).selectAll("g.action")
			.data(d.values);

		_actions.enter()
			.append("g")
			.attr("class","action")
			.attr("transform",function(c,i){
				return "translate(" + [_actionWidth,i * _catHeight / _length] + ")"
			});
			
		_actions.append("rect")
			.attr("class",function(d){
				return "action-bg " + d.key.replace(/\W/g, '').toLowerCase();
			})
			.attr("width",_actionWidth)
			.attr("height",function(d){
				return _catHeight / _length;
			})
			.style("fill",function(d,i){
				//return "url(#grad)";
				return "#FFF";
				/*var _parentColor = d3.select(this.parentNode.parentNode).select(".cat-bg")
					.style("fill");
				return d3.rgb(_parentColor).brighter((i) / _length)*/
			});

		_actions.append("foreignObject")
			.attr("width",_actionWidth)
			.attr("height",function(d){
				return _catHeight / _length;
			})
			.append("xhtml:body")
			.attr("class","f-object-body")
			.style("height",function(d){
				return _catHeight / _length + "px";
			})
			.style("background-color","#444")
			.append("p")
			.html(function(d){
				return d.key;
			})
			.attr("title",function(d){ return d.key })
			.style("font-size","11px");

		_actions.each(function(g){
			var _slength = g.values.length;

			var _labels = d3.select(this).selectAll("g.lbl")
				.data(g.values);

			_labels.enter()
				.append("g")
				.attr("class",function(d){
					return "lbl " + d.key.replace(/\W/g, '').toLowerCase();
				})
				.attr("transform",function(c,i){
					return "translate(" + [_actionWidth,i * _catHeight / _length / _slength] + ")"
				});
				
			_labels.append("rect")
				.attr("class",function(d){
					return "lbl-bg " + d.key.replace(/\W/g, '').toLowerCase();
				})
				.attr("width",_labelWidth + _pointsWidth)
				.attr("height",function(d){
					return _catHeight / _length / _slength;
				})
				//.style("stroke","#222")
				//.style("stroke-width",0.5)
				.style("fill",function(d,i){
					//return "url(#grad)";
					return "#FFF";
					/*var _parentColor = d3.select(this.parentNode.parentNode).select(".action-bg")
						.style("fill");
					return d3.rgb(_parentColor).brighter((i) / _slength)*/
				});

			_labels.append("line")
				.attr("x1",_labelWidth)
				.attr("y1",0.5)
				.attr("x2",_labelWidth + _pointsWidth)
				.attr("y2",0.5)
				.style("stroke","#CCC")
				.style("stroke-width",0.5)

			_labels.append("foreignObject")
				.attr("width",_labelWidth)
				.attr("height",function(d){
					return _catHeight / _length / _slength;
				})
				.append("xhtml:body")
				.attr("class","f-object-body")
				.style("height",function(d){
					return _catHeight / _length / _slength + "px";
				})
				.style("background-color","#555")
				.append("p")
				.html(function(d){
					return d.key;
				})
				.attr("title",function(d){ return d.key })
				.style("font-size","11px");

			_labels.each(function(f){
				var _pointHeight = d3.select(this).select("rect.lbl-bg").attr("height");

				var _pointEnv = d3.select(this);
				var _points = d3.select(this).selectAll("g.point")
					.data(f.values);

				_points.enter()
					.append("rect")
					.attr("class",function(d){
						return "point u-" + d.uuid.replace(/\W/g, '').toLowerCase() + " s-" + d.sessionID;
					})
					.attr("height",_pointHeight)
					.attr("width",_pointWidth)
					.attr("x",function(d){
						if(_lastBands.indexOf(d) !== -1){
							var _sel = d3.select(this),
								_parent = d3.select(this.parentNode),
									_pt = d3.transform(_parent.attr("transform")),
									_px = _pt.translate[0],
									_py = _pt.translate[1],
								_grandParent = d3.select(this.parentNode.parentNode),
									_gpt = d3.transform(_grandParent.attr("transform")),
									_gpx = _gpt.translate[0],
									_gpy = _gpt.translate[1],
								_greatGrandParent = d3.select(this.parentNode.parentNode.parentNode),
									_ggpt = d3.transform(_greatGrandParent.attr("transform")),
									_ggpx = _ggpt.translate[0],
									_ggpy = _ggpt.translate[1];

							var _originOffsetY = _activityHeight + margin.bottom + margin.top,
								_originOffsetX = +_px + +_gpx + +_ggpx;
							svg.append("rect")
							.datum(d)
							.attr("class","end-point u-" + d.uuid.replace(/\W/g, '').toLowerCase() + " s-" + d.sessionID)
							.attr("width",_pointWidth)
							.attr("height", _eventHeight)
							.attr("x",_xScale(d.relts) - 1.5)
							.attr("transform","translate(" + [_originOffsetX,_originOffsetY] + ")")
							.style("opacity",0);
							

						}
						return _xScale(d.relts);
					})
					.style("opacity",0.5);

				return null;
			});
			return null;
		});
		return null;
	});


};

function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = date+'-'+month+'-'+year;//+' '+hour+':'+min+':'+sec ;
	return time;
}

function readableTime(UNIX_timestamp){
	var a = new Date(UNIX_timestamp);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = month + " " + date + ", " + year;//+' '+hour+':'+min+':'+sec ;
	return time;
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
