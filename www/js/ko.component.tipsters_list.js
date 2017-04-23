// Knockout module for Tipsters page
// Template location: TipsterBundle/Resources/assets/js/templates/ko.component.tipsters_list.html
(function($) {


    ko.components.register("tipsters-list", {
        "viewModel": function(params) {
            var self = this;

            self.queryString = null;
            self.loading = ko.observable(true);
            self.error = ko.observable(false);
            self.tipsters = ko.observable([]);
            self.total = ko.observable(0);
            self.filtered_total = ko.observable(0);
            self.page = ko.observable(params.page || 1);
            self.first_state = true;
            self.itemsPerPage = 20;
            self.first_init = false;
            self.numberOfPages = ko.computed(function() {
                if(self.filtered_total) {
                    return Math.ceil(self.filtered_total() / self.itemsPerPage);
                }
            });
            self.prevPageUrl = ko.computed(function() {
                var ret = '#';

                if(self.page() > 1) {
                    ret = TSapp.Router('ts_tipster.list_page', self.page() - 1);
                }

                return ret;

            });
            self.nextPageUrl = ko.computed(function() {
                var ret = '#';

                if(self.page() < self.numberOfPages()) {
                    ret = TSapp.Router('ts_tipster.list_page', self.page() + 1);
                }

                return ret;

            });
            self.usePager = true;
            self.pagerInput = ko.pureComputed({
                read: function () {
                    return self.page();
                },
                write: function (value) {
                    return self.page(value);
                }
            }).extend({ throttle: TSapp.is_mobile ? 2000 : 500 });

            // Init outside modules needed for dynamically generated list
            TSapp.TipsterHeader.init();

            self.filters = {
                "site_id": {
                    "observe":ko.observableArray([], self),
                    "default": [],
                    "name": "Tipster service",
                    "values": TSapp.sites
                },
                "fav_sport_id": {
                    "observe":ko.observableArray([], self),
                    "default": [],
                    "name": "Favorite sport",
                    "values": ko.observableArray([], self)
                },
                "picks": {
                    "observe":ko.observableArray([], self),
                    "default": [],
                    "name": "Picks",
                    "values": [
                        {'name':'Any number of Picks','id':null},
                        {'name':'Over 100 picks','id':100},
                        {'name':'Over 250 picks','id':250},
                        {'name':'Over 500 picks','id':500},
                        {'name':'Over 1000 picks','id':1000}
                    ]
                }
            };


            self.sort = ko.observable('rank');

            var listHeadersDefinitions = [
                {'name':'Topster Index','sortKey':'rank', 'css': { 'd-lg-flex': true, 'ts': true }, 'inUse': {}},
                {'name':'Profitability','sortKey':'profitability', 'css': { 'd-none': true, 'd-lg-flex': true, 'prof': true }, 'inUse': {}},
                {'name':'Stability','sortKey':'stability', 'css': { 'd-none': true, 'd-lg-flex': true, 'stab': true }, 'inUse': {}},
                {'name':'Experience','sortKey':'experience', 'css': { 'd-none': true, 'd-lg-flex': true, 'exp': true }, 'inUse': {}},
                {'name':'Profit','sortKey':'profit', 'css': { 'profit': true }, 'inUse': {}},
                {'name':'Yield','sortKey':'yield', 'css': { 'yield': true }, 'inUse': {}},
                {'name':'Picks','sortKey':'picks', 'css': { 'pick': true }, 'inUse': {}}
            ];

            self.listHeaders = ko.utils.arrayMap(listHeadersDefinitions,function(listHead){
                if ( listHead.sortKey == 'rank' ) {
                    listHead.inUse.asc = ko.pureComputed(function () {
                        return self.sort() == listHead.sortKey
                    }, self);
                    listHead.inUse.dsc = ko.pureComputed(function () {
                        return self.sort() == '-' + listHead.sortKey
                    }, self);
                }
                else {
                    listHead.inUse.asc = ko.pureComputed(function () {
                        return self.sort() == '-' + listHead.sortKey
                    }, self);
                    listHead.inUse.dsc = ko.pureComputed(function () {
                        return self.sort() == listHead.sortKey
                    }, self);
                }
                return listHead;
            });



            self.query = ko.pureComputed(function() {
                var ret = {}, k;
                for (k in self.filters ) {
                    v = self.filters[k].observe();
                    if (v instanceof Array) {
                        v = ko.utils.arrayFilter(v, function(item) {
                            return item !== '' && item !== null;
                        });
                    }
                    if ( v === "" || ( v instanceof Array && v.length === 0 ) ) {

                    }
                    else {
                        if ( k === "name" ){
                            if ( v && v.replace(/[^a-zA-Z0-9]/ig,"").length >= 3 ) {
                                ret[k] = v;
                            }
                        }
                        else {
                            if ( v instanceof Array ) {
                                ret[k] = v;
                            }
                            else {
                                ret[k] = [v];
                            }
                        }
                    }
                }

                return ret;
            }, self);

            self.filtersInUse = ko.pureComputed(function() {
                return Object.keys(self.query()).length > 0
            },self);

            self.jumpToTop = function() {
                TSapp.CacheDOM.getCachedDOM().$htmlBody.animate({scrollTop: 0}, TSapp.Constants.get().defaultAnimationSpeed);
            };

            self.setServiceFilter = function(serviceFilter){

                if (-1 === self.filters.site_id.observe.indexOf(serviceFilter.id)) {
                    self.filters.site_id.observe.removeAll();
                    self.filters.site_id.observe.push(serviceFilter.id);
                }
                else {
                    self.filters.site_id.observe.remove(serviceFilter.id);
                }

            };

            self.resetFilters = function () {
                ko.utils.objectForEach(self.filters,function(k,v){
                    v.observe([]);
                });
            };

            self.prevPage = function(vm,event) {
                var current = self.page();

                event.preventDefault();
                self.page(current - 1);
                self.usePager ? TSapp.Router("tipsters_list", current - 1) : "#";
                self.jumpToTop();
                event.currentTarget.blur();
            };

            self.setSorting = function(listHead){
                var sort = self.sort();
                if ( sort == listHead.sortKey ) {
                    self.sort('-'+listHead.sortKey);
                }
                else if(sort == '-'+listHead.sortKey){
                    self.sort(listHead.sortKey);
                }
                else {
                    if (listHead.sortKey == 'rank') {
                        self.sort(listHead.sortKey);
                    }
                    else {
                        self.sort('-'+listHead.sortKey);
                    }
                }
            };

            self.nextPage = function(vm,event) {
                var current = self.page();

                event.preventDefault();
                self.page(current + 1);
                self.usePager ? TSapp.Router("tipsters_list", current + 1) : "#";
                self.jumpToTop();
                event.currentTarget.blur();

            };


            self.saveState = function(replace) {
                var state = {
                    "query": self.query(),
                    "page": self.page(),
                    "sort": self.sort(),
                    "itemsPerPage": self.itemsPerPage
                };

                if ( self.first_state || !!replace ) {
                    self.first_state = false;
                    // need to check fro HTML5 Session management methods before using them,
                    // in older browsers that don't support this the entire rendering of the tipster list will fail with JS error
                    if(window.history.replaceState) {
                        history.replaceState(state, null, null);
                    }
                }
                else {
                    if(window.history.pushState) {
                        history.pushState(state, null, null);
                    }
                }

            };

            self.loadState = function(state) {
                if ( !!state ) {
                    for ( var k in state ) {
                        if ( k === "query" ) {
                            for ( var k2 in self.filters ) {
                                if ( k2 in state[k] ) {
                                    self.filters[k2].observe(state[k][k2]);
                                }
                                else {
                                    self.filters[k2].observe(self.filters[k2].default);
                                }
                            }
                        }
                        else if (typeof self[k] === "function") {
                            self[k](state[k]);
                        }
                    }
                }
                else {
                    if ( !!params.sport_id ) {
                        self.filters.fav_sport_id.observe([params.sport_id.toString()]);
                    }
                }

                self.first_state = true;
                self.loadTipsters.callme(0);
            };

            self.loadTipsters = TSapp.Debounce(function() {
                var message = {
                    "query": self.query(),
                    "page": self.page(),
                    "limit": self.itemsPerPage,
                    "sort": self.sort()
                };

                var queryString = TSapp.TipsterRepo.queryString(message);

                if ( queryString !== self.queryString ) {
                    self.queryString = queryString;
                    self.loading(true);
                    self.saveState();

                    var Promise = TSapp.TipsterRepo.get(message);

                    Promise.done(function(response) {
                        self.error(false);
                        self.page(response.page);
                        self.tipsters(response.data);
                        self.filtered_total(response.filtered_total);
                        self.total(response.total);
                        self.numberOfPages();
                        // Reinitalize tooltips from Bootstrap
                        // Tooltip icon in the list is not even displayed here, and couldn't click it because of the cover up link
                        // no need to init the module in that case, only for desktops
                        if(!TSapp.is_mobile) {
                            TSapp.BSTooltip.init();
                        }
                    }).fail(function() {
                        self.error(true);
                        console.warn('Error fetching tipsters');
                    }).always(function() {
                        self.loading(false);
                    });
                }

            }, 50);


            /* subscribes */
            self.query.subscribe(function() {
                if ( self.first_init ) {
                    self.page(1);
                }
                self.loadTipsters();
            });

            self.page.subscribe(function() {
                self.loadTipsters.callme(10);
            });

            self.filtered_total.subscribe(function() {
                self.loadTipsters.callme(10);
            });

            self.sort.subscribe(function(value) {
                self.page(1);
                self.loadTipsters.callme(10);
                if ( self.first_init && !self.first_state && !!value ) {
                    var asc = true;
                    if ( 0 === value.indexOf('-') ) {
                        asc = false;
                        value = value.substring(1);
                    }
                    if ( value == 'rank' ) {
                        asc = !asc;
                    }

                    var name = null;
                    ko.utils.arrayForEach(listHeadersDefinitions,function(item){
                        if (item.sortKey == value ){
                            name = item.title || item.name;
                        }
                    });

                    if ( name ) {
                        TSapp.ga.event('Tipster list','order','Order by: '+name+' '+(asc?'ASC':'DESC'));
                    }
                }
            });

            self.filters.fav_sport_id.observe.subscribe(function(values){
                if ( self.first_init && !self.first_state && !!values[0] ) {
                    var name = null;
                    ko.utils.arrayForEach(ko.unwrap(self.filters.fav_sport_id.values),function(item){
                        if (item.id == values[0] ){
                            name = item.title || item.name;
                        }
                    });
                    if ( name ) {
                        TSapp.ga.event('Tipster list', 'filter', 'Sport: ' + name);
                    }
                }
            });

            self.filters.picks.observe.subscribe(function(values){
                if ( self.first_init && !self.first_state && !!values[0] ) {
                    var name = null;
                    ko.utils.arrayForEach(ko.unwrap(self.filters.picks.values),function(item){
                        if (item.id == values[0] ){
                            name = item.title || item.name;
                        }
                    });
                    if ( name ) {
                        TSapp.ga.event('Tipster list','filter','Number of Picks: '+name);
                    }
                }
            });

            self.filters.site_id.observe.subscribe(function(values){
                if ( self.first_init && !self.first_state && values.length > 0 ) {
                    var name = null;
                    ko.utils.arrayForEach(ko.unwrap(self.filters.site_id.values),function(item){
                        if (item.id == values[values.length-1] ){
                            name = item.id;
                        }
                    });
                    if ( name ) {
                        TSapp.ga.event('Tipster list','filter','Tipster site: '+name);
                    }
                }
            });

            /* INIT */
            TSapp.TipsterRepo.favoriteSports().done(function(response) {
                self.filters.fav_sport_id.values(response);
                self.loadState(history.state);
                self.first_init = true;
            });


            $(window).on("popstate", function(Evt) {
                self.loadState(Evt.originalEvent.state);
            });

        },
        "template":{ element: "tipsters-list" }
    });

})(jQuery);