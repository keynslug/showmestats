jQuery(document).ready(function ($) {
    
    console.debug("Initializing layout...");

    // expand overall height
    $('.outerContainer').height($(document).height());
    $('.chozen').chosen();
    $('.tagged').tag();
    
    // text fields sexy effects
    $('.advtext, .taglist > .input > input')
        .on('focus', function () {
            $(this).parentsUntil('.formLayout', 'div').addClass('chzn-container-active');
        })
        .on('blur', function () {
            $(this).parentsUntil('.formLayout', 'div').removeClass('chzn-container-active');
        });

    // expansion actions    
    var expanded = false, firsttime = true;
    $('.expander').on('click', function () {
        if (expanded = !expanded) {
            $('.requestForm').addClass('expanded', 200, function () {
                if (firsttime) {
                }
            });
            $('.expander').toggleClass('expanded');
        } else {
            $('.requestForm').removeClass('expanded', 200);
            $('.expander').toggleClass('expanded');
        }
    });
    
    // fetch available buckets
    var gotBuckets = function (buckets) {
        $.each(buckets, function (i, bucket) {
            $('<option value="' + bucket.toString() + '">' + bucket.toString() + '</option>')
                .appendTo('#buckets');
        });
        $("#buckets").trigger("liszt:updated");
    };
    var getBuckets = function () {
        $.getJSON('/riak?buckets=true', function (json) {
            gotBuckets(json.buckets);
        });
    };
    
    getBuckets();
    
    // dynamic query builder
    var QueryBuilder = function (context, previewContext) {
        
        console.debug("Initializing query builder...");
            
        this.client = new RiakClient(
            "/riak",
            "/mapred"
        );
        
        var self = this;
        
        context.on('change', ['input', 'select', 'textarea'], function () {
            self.fieldAltered(this);
        });
            
        this.fieldAltered = function () {
            var values = this.getValues();
            var query = this.makeQuery(values);
            previewContext.text(JSON.stringify(query.request(), null, 4));
        };
        
        this.getValues = function () {
            var result = {
                inputs: $('#buckets option:selected', context).map(function () {
                    return this.value;
                }).get(),
                secondaryIndex: $('#secondaryIndex').attr('value'),
                secondaryIndexValue: $('#secondaryIndexValue').attr('value')
            };
            if (result.inputs.length > 1) {
                result.secondaryIndex = null;
                result.secondaryIndexValue = null;
            } else {
                result.inputs = result.inputs[0];
            }
            return result;
        };
        
        this.makeQuery = function (args) {
    
            var mapper = new RiakMapper(
                    this.client, 
                    args.inputs, 
                    args.secondaryIndex ? args.secondaryIndex : null, 
                    args.secondaryIndex ? args.secondaryIndexValue : null
                );
                
            mapper.map(
                this.makeMapPhase(args.mapPhase ? args.mapPhase : null)
            );
            
            if (args.reducePhase) {
                mapper.reduce(
                    this.makeReducePhase(args.reducePhase)
                );
            }
            
            return mapper;
        };
        
        var defaultMapPhase =
            function (value, keyData, arg) { return [ Riak.mapValuesJson(value)[0] ]; };
        
        this.makeMapPhase = function (phase) {
            var o = {source: defaultMapPhase};
            if (phase) {
                o.source = [
                    "function (value, keyData, arg) { ",
                    "var data = Riak.mapValuesJson(value)[0]; ",
                    phase.replace(/\n/, '', 'g'),
                    " }"
                ];
                o.source = o.source.join('');
            }
            return o;
        };
        
        this.makeReducePhase = function (phase) {
            var o = {source: [
                "function (values, arg) { ",
                phase.replace(/\n/, '', 'g'),
                "}"
            ]};
            o.source = o.source.join('');
            return o;
        };
        
        this.submitQuery = function () {
            var values = this.getValues(), query = this.makeQuery(values);
            console.debug("Running mapreduce query...");
            query.run(null, function (status, response) {
                console.log(status, response);
            });
        };
    };
    
    var builder = new QueryBuilder($('.formLayout form'), $('#preview'));
    
    $('#submit').on('click', function () {
        builder.submitQuery();
        return false;
    });
    
});
