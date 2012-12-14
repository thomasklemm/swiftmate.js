// Generated by CoffeeScript 1.4.0
(function() {
  var $, Query, Suggestion, SuggestionCollection, Swiftmate,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  Query = (function() {

    function Query(minLength) {
      this.minLength = minLength;
      this.value = '';
      this.lastValue = '';
    }

    Query.prototype.getValue = function() {
      return this.value;
    };

    Query.prototype.setValue = function(newValue) {
      this.lastValue = this.value;
      return this.value = newValue;
    };

    Query.prototype.hasChanged = function() {
      return !(this.value === this.lastValue);
    };

    Query.prototype.willHaveResults = function() {
      return this._isValid();
    };

    Query.prototype._isValid = function() {
      return this.value.length >= this.minLength;
    };

    return Query;

  })();

  Suggestion = (function() {

    function Suggestion(index, data, type) {
      this.data = data;
      this.type = type;
      this.id = "" + index + "-swiftmate-suggestion";
      this.index = index;
    }

    Suggestion.prototype.select = function(callback) {
      return callback(this.data, this.type, this.index, this.id);
    };

    Suggestion.prototype.focus = function() {
      return this.element().addClass('focus');
    };

    Suggestion.prototype.blur = function() {
      return this.element().removeClass('focus');
    };

    Suggestion.prototype.render = function(callback) {
      return "<li id=\"" + this.id + "\" class=\"swiftmate-suggestion\">\n  " + (callback(this.data, this.type, this.index, this.id)) + "\n</li>";
    };

    Suggestion.prototype.element = function() {
      return $('#' + this.id);
    };

    return Suggestion;

  })();

  SuggestionCollection = (function() {

    function SuggestionCollection(renderCallback, selectCallback) {
      this.renderCallback = renderCallback;
      this.selectCallback = selectCallback;
      this.focusedIndex = -1;
      this.suggestions = [];
    }

    SuggestionCollection.prototype.update = function(results) {
      var i, result, type, typeResults, _results;
      this.suggestions = [];
      i = 0;
      _results = [];
      for (type in results) {
        typeResults = results[type];
        _results.push((function() {
          var _i, _len, _results1;
          _results1 = [];
          for (_i = 0, _len = typeResults.length; _i < _len; _i++) {
            result = typeResults[_i];
            this.suggestions.push(new Suggestion(i, result, type));
            _results1.push(i += 1);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    SuggestionCollection.prototype.blurAll = function() {
      var suggestion, _i, _len, _ref, _results;
      this.focusedIndex = -1;
      _ref = this.suggestions;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        suggestion = _ref[_i];
        _results.push(suggestion.blur());
      }
      return _results;
    };

    SuggestionCollection.prototype.render = function() {
      var h, suggestion, type, _i, _len, _ref;
      h = '';
      if (this.suggestions.length) {
        type = null;
        _ref = this.suggestions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          suggestion = _ref[_i];
          if (suggestion.type !== type) {
            if (type !== null) {
              h += this._renderTypeEnd(type);
            }
            type = suggestion.type;
            h += this._renderTypeStart();
          }
          h += this._renderSuggestion(suggestion);
        }
        h += this._renderTypeEnd(type);
      }
      return h;
    };

    SuggestionCollection.prototype.count = function() {
      return this.suggestions.length;
    };

    SuggestionCollection.prototype.focus = function(i) {
      if (i < this.count()) {
        this.blurAll();
        if (i < 0) {
          return this.focusedIndex = -1;
        } else {
          this.suggestions[i].focus();
          return this.focusedIndex = i;
        }
      }
    };

    SuggestionCollection.prototype.focusElement = function(element) {
      var index;
      index = parseInt($(element).attr('id'));
      return this.focus(index);
    };

    SuggestionCollection.prototype.focusNext = function() {
      return this.focus(this.focusedIndex + 1);
    };

    SuggestionCollection.prototype.focusPrevious = function() {
      return this.focus(this.focusedIndex - 1);
    };

    SuggestionCollection.prototype.selectFocused = function() {
      if (this.focusedIndex >= 0) {
        return this.suggestions[this.focusedIndex].select(this.selectCallback);
      }
    };

    SuggestionCollection.prototype.allBlured = function() {
      return this.focusedIndex === -1;
    };

    SuggestionCollection.prototype._renderTypeStart = function() {
      return "<li class=\"swiftmate-type-container\">\n  <ul class=\"swiftmate-type-suggestions\">";
    };

    SuggestionCollection.prototype._renderTypeEnd = function(type) {
      return "  </ul>\n  <div class=\"swiftmate-type\">" + type + "</div>\n</li>";
    };

    SuggestionCollection.prototype._renderSuggestion = function(suggestion) {
      return suggestion.render(this.renderCallback);
    };

    return SuggestionCollection;

  })();

  Swiftmate = (function() {
    var KEYCODES;

    KEYCODES = {
      9: 'tab',
      13: 'enter',
      27: 'escape',
      38: 'up',
      40: 'down'
    };

    function Swiftmate(input, options) {
      var documentTypes, engineKey, facets, fetchFields, filters, functionalBoosts, maxResults, minQueryLength, renderCallback, searchFields, selectCallback, sortDirection, sortField, that, timeout, url;
      this.input = input;
      this.handleKeyup = __bind(this.handleKeyup, this);

      this.handleKeydown = __bind(this.handleKeydown, this);

      that = this;
      url = options.url, engineKey = options.engineKey, documentTypes = options.documentTypes, filters = options.filters, searchFields = options.searchFields, functionalBoosts = options.functionalBoosts, sortField = options.sortField, sortDirection = options.sortDirection, fetchFields = options.fetchFields, facets = options.facets, maxResults = options.maxResults, renderCallback = options.renderCallback, selectCallback = options.selectCallback, minQueryLength = options.minQueryLength, timeout = options.timeout;
      this.url = url || 'https://api.swiftype.com/api/v1/public/engines/suggest.json';
      this.engineKey = engineKey;
      this.types = documentTypes;
      this.filters = filters;
      this.searchFields = searchFields;
      this.functionalBoosts = functionalBoosts;
      this.sortField = sortField;
      this.sortDirection = sortDirection;
      this.fetchFields = fetchFields;
      this.facets = facets;
      this.maxResults = maxResults || 5;
      this.timeout = timeout || 1000;
      this.xhr = null;
      selectCallback = selectCallback || this._defaultSelectCallback;
      minQueryLength = minQueryLength || 2;
      this.suggestions = new SuggestionCollection(renderCallback, selectCallback);
      this.query = new Query(minQueryLength);
      if ($('ul#swiftmate').length > 0) {
        this.container = $('ul#swiftmate');
      } else {
        this.container = $('<ul id="swiftmate">').insertAfter(this.input);
      }
      this.container.delegate('.swiftmate-suggestion', {
        mouseover: function() {
          return that.suggestions.focusElement(this);
        },
        click: function(event) {
          event.preventDefault();
          that.suggestions.selectFocused();
          return that.input.focus();
        }
      });
      this.input.keydown(this.handleKeydown).keyup(this.handleKeyup).mouseover(function() {
        return that.suggestions.blurAll();
      });
    }

    Swiftmate.prototype.handleKeydown = function(event) {
      var killEvent;
      killEvent = true;
      switch (KEYCODES[event.keyCode]) {
        case 'escape':
          this.hideContainer();
          break;
        case 'tab':
          this.suggestions.selectFocused();
          break;
        case 'enter':
          this.suggestions.selectFocused();
          if (this.suggestions.allBlured()) {
            killEvent = false;
          }
          break;
        case 'up':
          this.suggestions.focusPrevious();
          break;
        case 'down':
          this.suggestions.focusNext();
          break;
        default:
          killEvent = false;
      }
      if (killEvent) {
        event.stopImmediatePropagation();
        return event.preventDefault();
      }
    };

    Swiftmate.prototype.handleKeyup = function(event) {
      this.query.setValue(this.input.val());
      if (this.query.hasChanged()) {
        if (this.query.willHaveResults()) {
          this.suggestions.blurAll();
          return this.fetchResults();
        } else {
          return this.hideContainer();
        }
      }
    };

    Swiftmate.prototype.hideContainer = function() {
      this.suggestions.blurAll();
      this.container.hide();
      return $(document).unbind('click.swiftmate');
    };

    Swiftmate.prototype.showContainer = function() {
      var _this = this;
      this.container.show();
      return $(document).bind('click.swiftmate', function(event) {
        if (!_this.container.has($(event.target)).length) {
          return _this.hideContainer();
        }
      });
    };

    Swiftmate.prototype.fetchResults = function() {
      var _this = this;
      if (this.xhr != null) {
        this.xhr.abort();
      }
      return this.xhr = $.ajax({
        url: this.url,
        dataType: 'jsonp',
        timeout: this.timeout,
        cache: true,
        data: {
          q: this.query.getValue(),
          engine_key: this.engineKey,
          filters: this.filters,
          search_fields: this.searchFields,
          functional_boosts: this.functionalBoosts,
          fetch_fields: this.fetchFields,
          sort_field: this.sortField,
          sort_direction: this.sortDirection,
          facets: this.facets,
          per_page: this.maxResults
        },
        success: function(data) {
          return _this.update(data.records);
        }
      });
    };

    Swiftmate.prototype.update = function(results) {
      this.suggestions.update(results);
      if (this.suggestions.count() > 0) {
        this.container.html($(this.suggestions.render()));
        return this.showContainer();
      } else {
        return this.hideContainer();
      }
    };

    Swiftmate.prototype._defaultSelectCallback = function(data) {
      return window.location = data.url;
    };

    return Swiftmate;

  })();

  $.fn.swiftmate = function(options) {
    new Swiftmate($(this), options);
    return $(this);
  };

}).call(this);