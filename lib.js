var qq = {};

qq.logObject = function(obj, prefix, posfix){
  for ( var key in obj ) {
  	console.log(prefix || '', key, ':', obj[key], posfix || '');
  }
};

qq.extend = function(){
  var result = arguments[0];
  for ( var i = 0, l = arguments.length; i < l; i++ ) {
    var obj = arguments[i];
  	for ( var key in obj ) {
  	  result[key] = obj[key];
  	}
  }
  return result;
};

qq.selector = function(selector){
  return document.querySelectorAll(selector);
};

qq.id = function(id){
  return document.getElementById(id);
};

qq.class = function(className){
  return document.getElementsByClassName(className);
};

qq.tag = function(tagName){
  return document.getElementsByTagName(tagName);
};

qq.ajax = function(params){
  function getUrl(url, data){
  	return url + ( data ? '?' + qq.param(data) : '' );
  };
  function parseDomain(urlStr){
    return urlStr.replace(/^http(?:s)?\:\/\/([\-\.a-zа-я0-9]+\.[a-z]{2,6}).*$/i, '$1').toLowerCase();
  };
  function loadViaXMLHttpRequest(){
  	var request = new XMLHttpRequest();
  	var onComplete = function(e){
      if ( e.statusText === 'OK' ) {
      	params.success && params.success(e.responseText);
      }
      else {
      	params.error && params.error(e);
      }
  	};
  	request.open(
      params.type || 'GET',
      getUrl(params.url, params.data),
      true
    );
    request.onreadystatechange = params.complete
      ? params.complete
      : onComplete;
    request.send();
  };
  function loadViaScript(){
  	var id = 'qq_' + +new Date();
  	window[id] = function(data){
  	  !params.complete
  	  	? params.success(data)
  	  	: params.complete({
  	  	  statusText: 'OK',
  	  	  status:'200',
  	  	  responseText: JSON.stringify(data)
  	  	});
  	  onComplete();
  	};
  	var onComplete = function(){
  	  var elem = qq.id(id);
  	  elem.parentNode.removeChild(elem);
  	  if ( window[id] ) {
  	  	delete window[id];
  	  }
  	};
  	var scriptEl = qq.create('script', {
  	  id: id,
  	  src: getUrl(params.url, qq.extend({ callback: id }, params.data)),
  	  onerror: function(e){
  	  	params.error(e);
  	  	onComplete();
  	  }
  	});
  	document.body.appendChild(scriptEl);
  };
  params.dataType.toLowerCase() === 'jsonp' && parseDomain(params.url) !== location.hostname
  	? loadViaScript()
  	: loadViaXMLHttpRequest();
};

qq.param = function(obj){
  var result = [];
  for ( var key in obj ) {
  	result.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return result.join('&');
};

qq.create = function(tagName, attributes){
  var elem = document.createElement(tagName);
  for ( var key in attributes ) {
  	elem[key] = attributes[key];
  }
  return elem;
};
