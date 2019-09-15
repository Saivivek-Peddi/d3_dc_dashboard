var numberFormat = d3.format(".2f");
var chart = dc.rowChart("#gender_chart");
var trtypechart = dc.pieChart('#trtypeChart');

Promise.all([d3.json("/data")]).then(async(x)=>{makeGraphs(x[0])});
    function makeGraphs(inpData) {
        var ndx = crossfilter(inpData);
        
        function myfunc(grp){
            var arr = grp.all();
            var total_soa = 0;
            var total_cnt = 0;
            for(var i =0;i<arr.length;i++){
                total_soa += arr[i].value.soa_y_cnt;
                total_cnt += arr[i].value.fund_total_cnt;
            }
            return total_soa/total_cnt;
        }
        
        var gender_dim = ndx.dimension(function(d) {return d.FundName.toUpperCase();});
        var count_by_gender = gender_dim.group().reduce(
            //add
            function(p,v){
                ++p.fund_total_cnt;
                if(v.SLA_adherence=="Within SLA"){
                    ++p.soa_y_cnt;
                }
                if(p.soa_y_cnt==0){
                    p.fin_ratio = 0;
                } else{
                    p.fin_ratio = p.soa_y_cnt/p.fund_total_cnt;
                }
                return p;
            },
            //remove
            function(p,v){
                --p.fund_total_cnt;
                if(v.SLA_adherence=="Within SLA"){
                    --p.soa_y_cnt;
                }
                if(p.soa_y_cnt==0){
                    p.fin_ratio=0;
                    p.non_fin_ratio =1;
                } else{
                    p.fin_ratio=p.soa_y_cnt/p.fund_total_cnt;
                    p.non_fin_ratio = 1-p.fin_ratio;
                }
                return p;
            },
            //init
            function(){
                return{
                    fund_total_cnt:0,
                    soa_y_cnt:0,
                    fin_ratio:0,
                    non_fin_ratio:0,
                }
            }  
        );
        chart
            .width(600)
            .height(850)
            .elasticX(true)
            .dimension(gender_dim)
            .group(count_by_gender)
            .valueAccessor(function (d) {
                return d.value.fin_ratio;})
            .on('pretransition', function(chart) {
                var x_vert = myfunc(count_by_gender);
                // console.log(x_vert);
                var extra_data = [
                    {x: chart.x()(x_vert), y: 0},
                    {x: chart.x()(x_vert), y: chart.effectiveHeight()}
                ];
                var line = d3.line()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; })
                    .curve(d3.curveLinear);
                var chartBody = chart.select('g');
                var path = chartBody.selectAll('path.extra').data([extra_data]);
                path = path.enter()
                        .append('path')
                        .attr('class', 'extra')
                        .attr('stroke', 'red')
                        .attr('id', 'extra-line')
                        .attr("stroke-width", 1)
                        .style("stroke-dasharray", ("10,3"))
                    .merge(path);
                path.attr('d', line);
            });
        
        var trtype_dim = ndx.dimension(function(d) {return d.Asset_Class;});
        var count_by_trtype = trtype_dim.group();
        // console.log(count_by_trtype.all())
        trtypechart
            .width(550)
            .height(200)
            .externalRadiusPadding(20)
            .drawPaths(true)
            .dimension(trtype_dim)
            .group(count_by_trtype)
            .legend(dc.legend());
            
        trtypechart.on('pretransition', function(chart) {
            chart.selectAll('.dc-legend-item text')
                .text('')
                .append('tspan')
                .text(function(d) { return d.name; })
                .append('tspan')
                .attr('x', 150)
                .attr('text-anchor', 'end')
                .text(function(d) { return d.data; });
            chart.selectAll('text.pie-slice').text(function(d) {
                    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
                })
        });
        // trtypechart.render();
        var SLA_graph = ndx.dimension(function(d) {return d.SLA_adherence;});
        var count_by_SLA = SLA_graph.group();
        var SLA_chart = dc.pieChart('#SLA_chart');
        SLA_chart
            .width(550)
            .height(200)
            .externalRadiusPadding(20)
            .dimension(SLA_graph)
            .group(count_by_SLA)
            .legend(dc.legend());
        SLA_chart.on('pretransition', function(chart) {
            chart.selectAll('.dc-legend-item text')
                .text('')
                .append('tspan')
                .text(function(d) { return d.name; })
                .append('tspan')
                .attr('x', 120)
                .attr('text-anchor', 'end')
                .text(function(d) { return d.data; });
            chart.selectAll('text.pie-slice').text(function(d) {
                    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
                })
        });

        var trn_status_graph = ndx.dimension(function(d) {return d.TrxnStatus;});
        var count_by_trn_status = trn_status_graph.group();
        var trn_status_chart = dc.pieChart('#trn_status_chart');
        trn_status_chart
            .width(550)
            .height(200)
            .dimension(trn_status_graph)
            .group(count_by_trn_status)
            .legend(dc.legend());
        trn_status_chart.on('pretransition', function(chart) {
            chart.selectAll('.dc-legend-item text')
                .text('')
                .append('tspan')
                .text(function(d) { return d.name; })
                .append('tspan')
                .attr('x', 150)
                .attr('text-anchor', 'end')
                .text(function(d) { return d.data; });
            chart.selectAll('text.pie-slice').text(function(d) {
                    return ' ';
                })
        });

        var source_graph = ndx.dimension(function(d) {return d.Source;});
        var count_by_source = source_graph.group();
        var source_chart = dc.pieChart('#source_chart');
        source_chart
            .width(550)
            .height(200)
            .drawPaths(true)
            .dimension(source_graph)
            .group(count_by_source)
            .legend(dc.legend());
        source_chart.on('pretransition', function(chart) {
            chart.selectAll('.dc-legend-item text')
                .text('')
                .append('tspan')
                .text(function(d) { return d.name; })
                .append('tspan')
                .attr('x', 150)
                .attr('text-anchor', 'end')
                .text(function(d) { return d.data; });
            chart.selectAll('text.pie-slice').text(function(d) {
                    return   ' ';
                })
        });
   dc.renderAll();
}
