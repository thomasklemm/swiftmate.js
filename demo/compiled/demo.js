// Generated by CoffeeScript 1.4.0
(function() {
  var render;

  $('#search-input').focus();

  render = function(data, type) {
    return data.title;
  };

  $('#search-input').swiftmate({
    engineKey: '5eMMdfkKCgz5wxyhR9RL',
    renderCallback: render,
    minQueryLength: 2,
    maxResults: 5
  });

}).call(this);
