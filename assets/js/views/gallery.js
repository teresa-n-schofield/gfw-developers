(function(root) {

  'use strict';

  root.app = root.app || {};
  root.app.View = root.app.View || {};
  root.app.Collection = root.app.Collection || {};

  root.app.Collection.GalleryCollection = Backbone.Collection.extend({

    // If you insert one more gallery post
    // you need to set the order here
    order: [
      "gfw-interactive-map",
      "countries",
      "forest-watcher-mobile",
      "climate",
      "commodities",
      "fires",
      "gfw-pro",
      "water",
      "open-data-portal",
      "cameroon-forest-atlas",
      "central-african-republic-forest-atlas",
      "democratic-republic-congo-forest-atlas",
      "equatorial-guinea-forest-atlas",
      "gabon-forest-atlas",
      "georgia-forest-land-use",
      "liberia-forest-atlas",
      "madagascar-forest-atlas",
      "republic-congo-forest-atlas",
      "logging-roads",
      "alertas-tempranas-por-megaproyetos",
      "bosques-abiertos",
      "forests-and-finance",
      "global-forest-link",
      "high-conservation-value-forests",
      "land-mark",
      "maap",
      "open-foris",
      "open-landscape-platform",
      "paraguay-indigenous-lands",
      "protecting-forest",
      "roundtable-on-sustainable-palm-oil",
      "selva-maya",
      "spott",
      "systeme-de-suivi-de-la-degradation",
      "tomnod",
      "tropical-forest-alliance-2020"
    ],

    filters: {
      "africa" : "Africa",
      "asia" : "Asia",
      "boreal-forests" : "Boreal forests",
      "commodities" : "Commodities",
      "crowdsourcing" : "Crowdsourcing",
      "data" : "Data",
      "fires" : "Fires",
      "global-forest-watch" : "Global Forest Watch",
      "latin-america" : "Latin America",
      "logging" : "Logging",
      "map-builder" : "Map Builder",
      "maps" : "Maps",
      "mining" : "Mining",
      "mobile" : "Mobile",
      "palm-oil" : "Palm oil",
      "satellite-imagery" : "Satellite imagery",
    },

    url: baseurl + '/json/gallery.json',

    comparator: function(item) {
      return this.order.indexOf(item.get("slug"));
    },

    getPaginatedCollection: function(currentPage,itemsOnPage,filter) {
      var filteredCollection = (filter == 'all') ? this.toJSON() : this.filter(filter);
      return filteredCollection.slice(currentPage*itemsOnPage, (currentPage*itemsOnPage) + itemsOnPage)
    },

    getCount: function(filter) {
      var filteredCollection = (filter == 'all') ? this.toJSON() : this.filter(filter);
      return filteredCollection.length;
    },

    getFilters: function() {
      return this.filters;
    },

    filter: function(filter) {
      return _.compact(_.map(this.toJSON(), function(v){
        return (v.filters.indexOf(filter) != -1) ? v : null
      }))
    }

  });


  // View for display results
  root.app.View.GalleryView = Backbone.View.extend({

    el: '#galleryView',

    template: HandlebarsTemplates['gallery'],

    model: new (Backbone.Model.extend({
      defaults: {
        currentPage: 0,
        itemsOnPage: 9,
        filter: 'all'
      }
    })),

    events: {
      'click #galleryFilters li' : 'changeFilter'
    },

    initialize: function() {
      this.setParams();
      this.setListeners();

      // Fetch collection
      this.collection = new root.app.Collection.GalleryCollection();
      this.collection.fetch().done(function(){
        this.render(false);
      }.bind(this));
    },

    setParams: function() {
      var filterParam = location.search.split('filter=')[1];
      if (filterParam) {
        this.model.set('filter', filterParam);
      }
    },

    setListeners: function() {
      this.model.on('change:currentPage', this.render.bind(this));
      this.model.on('change:filter', this.render.bind(this));
    },

    render: function(dont_scroll) {
      if (!!dont_scroll) {
        this.scrollToTop();
      }
      this.$el.html(this.template({
        gallery: this.collection.getPaginatedCollection(this.model.get('currentPage'),this.model.get('itemsOnPage'),this.model.get('filter')),
        filters: this.collection.getFilters(),
        pagination: (this.collection.getCount(this.model.get('filter')) > this.model.get('itemsOnPage'))
      }));

      this.cache();

      this.initPaginate();
      this.initFilter();
    },

    cache: function() {
      this.$paginator = this.$el.find('#gallery-paginator');
      this.$filters = this.$el.find('#galleryFilters');
    },

    // Inits after render
    initPaginate: function(){
      // pagination
      this.$paginator.pagination({
        items: this.collection.getCount(this.model.get('filter')),
        itemsOnPage: this.model.get('itemsOnPage'),
        currentPage: this.model.get('currentPage') + 1,
        displayedPages: 3,
        edges: 1,
        selectOnClick: false,
        prevText: ' ',
        nextText: ' ',
        onPageClick: _.bind(function(page, e){
          e && e.preventDefault();
          this.$paginator.pagination('drawPage', page);
          this.model.set('currentPage', page-1);
        }, this )
      });
    },

    initFilter: function() {
      var filter = this.model.get('filter');
      this.$filters.find('li[data-value="'+filter+'"]').addClass('-active');
    },

    scrollToTop: function() {
      $("html, body").animate({
        scrollTop: this.$el.offset().top
      }, 250)
    },

    changeFilter: function(e) {
      this.model.set('currentPage', 0, { silent:true });
      this.model.set('filter', $(e.currentTarget).data('value'));
      this.setUrl();
      ga('send', 'event', 'Gallery', 'Tag Click', $(e.currentTarget).data('value'));
    },

    setUrl: function() {
      window.history.pushState({}, '', '?filter=' + this.model.get('filter'));
    }

  });

})(this);
