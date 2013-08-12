var chartFactory = {
    version: "0.0.1",
    charts: [],
    data: null,
    definitions: null
};


(function () {
      "use strict";

      chartFactory.createDash = function(data,definitions){
            chartFactory.data = data;
            chartFactory.definitions = definitions;
            var i = 0;
            definitions.charts.forEach(function(c){
                  var chartId = '#'+c.id;
                  chartFactory.charts[i] = chartFactory.createChart(chartId,data,c);
                  i = i+1;
            })

            if (definitions.filters){
                  definitions.filters.forEach(function(f){
                        var theDiv = '#'+f.id;
                        chartFactory.createFilterDropDown(theDiv, chartFactory.data, f.field,f.title,f.charts)
                  });      
            }
      }

      chartFactory.createChart = function(theDiv,data,theGraphDef){
            var svg = dimple.newSvg(theDiv, theGraphDef.width, theGraphDef.height);
            var theChart = new dimple.chart(svg, data);
            //theChart.setBounds(70, 30, 490, 310);
            theChart.setBounds(70,30,theGraphDef.width-140,theGraphDef.height-100);
            chartFactory.drawChart(theChart,theGraphDef);
            return theChart;
      }

      chartFactory.drawChart = function(theChart,theGraphDef){
            // x Axis definition
            var axis = theGraphDef.xAxis
            var x =null;
            if(axis.type == 'Category'){
                  x = theChart.addCategoryAxis("x", axis.field);
            } else if(axis.type == 'Pct'){
                  x = theChart.addPctAxis("x", axis.field);
            } else {
                  x = theChart.addMeasureAxis("x", axis.field);
            }
            if(axis.orderRule){
                  x.addOrderRule(axis.orderRule) 
            }

            // y Axis definition
            axis = theGraphDef.yAxis;
            x =null;
            if(axis.type == 'Category'){
                  x = theChart.addCategoryAxis("y", axis.field);
            } else if(axis.type == 'Pct'){
                  x = theChart.addPctAxis("y", axis.field);
            } else {
                  x = theChart.addMeasureAxis("y", axis.field);
            }     
            if(axis.orderRule){
                  x.addOrderRule(axis.orderRule) 
            }

            // TODO : y2 axis definition

            // z Axis definition : Bubble size
            if (theGraphDef.zAxis){
                  axis = theGraphDef.zAxis;
                  x =null;
                  x = theChart.addMeasureAxis("z", axis.field);
            }

            // z Axis definition : Bubble size
            if (theGraphDef.colorAxis){
                  axis = theGraphDef.colorAxis;
                  x =null;
                  x = theChart.addColorAxis(axis.field,axis.colors);
                  //addColorAxis("Sales Volume", ["#DA9694", "#FABF8F", "#C4D79B"])
            }

            // Adding series
            var series = theGraphDef.series;
            series.forEach(function(s){
                  var x = theChart.addSeries(s.fields, s.graphType);
                  if(s.onClick){
                        //console.log("adding onClick");
                        x.addEventHandler("click",s.onClick);
                  }
            });

            //Legend on top of graph
            //TODO : conditionner l'apparition de la legende
            theChart.addLegend(60, 10, theGraphDef.width, 40, "left");
            theChart.draw();
      }

      chartFactory.createFilterPanel = function(theDiv, data, field,fct){
            var values = dimple.getUniqueValues(data,field);
            values.push('*');
            d3.select(theDiv)
                  .selectAll(".filterValues")
                  .data([field])
                  .enter()
                  .append('h3')
                  .text(field + " :");
            var ul = d3.select(theDiv).append("ul")
            ul.selectAll(".filterValues")
                  .data(values)
                  .enter()
                  .append('li')
                  .attr('onClick',function(d, i) { 
                        if(d=="*"){x = fct+"(null)"}
                        else{x = fct+"('"+d+"')"};
                        return x; 
                  })
                  .text(function(d, i) { return d; })
      }

      chartFactory.resetUIFilters = function(){
            chartFactory.definitions.filters.forEach(function(f){
                  $('#'+ f.id + 'Dropdown').val('*');
            });
      }

      chartFactory.createFilterDropDown = function(theDiv, data, field,title,charts){
            var values = dimple.getUniqueValues(data,field);
            var html = '<p>' + title
            html = html + '<select id="' + theDiv.substr(1) + 'Dropdown">';
            html = html + '<option value="*">' + '*' + '</option>';
            values.forEach(function(v){
                  html = html + '<option value="' + v + '">' + v + '</option>';
            });
            html = html + '</select></p>'
            $(theDiv).html(html);

            $(theDiv + 'Dropdown').bind('change',function(e) {
                  //console.log(e.target.value);
                   if (e.target.value=='*') {
                         charts.forEach(function(c){
                              chartFactory.charts[c].data = chartFactory.data;
                              chartFactory.charts[c].draw(500);
                              //reseting all filters in the UI
                              chartFactory.resetUIFilters();
                         });
                   } else {
                         charts.forEach(function(c){
                              console.log(c)
                              chartFactory.charts[c].data = 
                                    dimple.filterData(data, field, e.target.value);
                              chartFactory.charts[c].draw(500);
                         });
                   }     
            });
      }
}());