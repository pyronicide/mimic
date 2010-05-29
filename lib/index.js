/*
 * Record interactions with javascript objects and functions.
 *
 * Dependencies:
 *     underscore.js (because I'm lazy and it's awsome)
 *     json2.js (in IE)
 *     jquery.js (for saving, fetching)
 */

var mimic = funciton(obj, priv, not_recursive) { 
  return new mimic.fn.init(obj, priv, not_recursive); 
};

mimic.fn = mimic.prototype = {
  init: function(obj, priv, not_recursive) {
    this.obj = obj;
    this.priv = priv;
    this.not_recursive = not_recursive;
    this.history = {};
    this.functions = [];
    this.defaults = {
      save: this._post,
      fetch: this._get
    };
    return this;
  },
  record: function() {
    this._wrap(this._report);
  },
  replay: function() {
    this._wrap(this._stub);
  },
  _wrap: function(wrapper) {
    var self = this;
    function inspect(obj, path) {
      _.each(obj, function(v, k) {
        if (!self.priv && k.match(/^_.*/)) return
        var current_path = path ? path + '.' + k : k;
        if (_.isFunction(v)) {
          self.functions.push(current_path);
          obj[k] = _.wrap(v, _.bind(wrapper, wrapper, current_path));
          return
        }
        if (!self.not_recursive) return inspect(v, current_path);
      });
    }
    inspect(self.obj);    
  },
  log: function() {
    /*
     * Echo interactions to the configured logger.
     */
  },
  _report: function(name, fn) {
    var args = _.toArray(arguments).slice(2);
    var resp = fn.apply(this, args);
    this.get_history(name).push({ resp: resp, args: args });
    return resp;
  },
  _stub: function(name, fn) {
    var resp = this.get_history(name).pop()
    if (!resp)
      return fn.apply(this, _.toArray(arguments).slice(2));
    return resp['resp'];
  },
  get_history: function(name) {
    if (k in this.history) return this.history[k];
    this.history[k] = [];
    return this.history[k];    
  },
  save: function(path, fn) {
    if (!fn)
      fn = this.defaults.save;
    fn(path);
  },
  _post: function(path) {
    $.post(path, JSON.stringify(this.history));
  },
  fetch: function(path, fn) {
    if (!fn)
      fn = this.defaults.fetch
    fn(path);
  },
  _get: function(path) {
    var self = this;
    $.get(path, function(v) {
      self.history = JSON.parse(v);
    });
  }
};

mimic.fn.init.prototype = mimic.fn;

mimic.extend - mimic.fn.extend = function() {
  // Later, no really.
}
