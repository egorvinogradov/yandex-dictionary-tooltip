
//
// Full articles: http://slovari.yandex.ru/~p/<< word >>/en-ru/
//
// Most proper translation: http://suggest-slovari.yandex.ru/suggest-lingvo
// Data = {
//   v: 5,
//   part: '<< word >>'
// }


/*
 * Extension JS
 */

function funcToString(func, args){
  var argsArray = [];
  if ( !func ) {
    return;
  }
  args = args || [];
  for ( var i = 0, l = args.length; i < l; i++ ) {
    var arg = args[i];
    var argStr;
    if ( typeof arg === 'number' ) {
      argStr = arg;
    }
    else if ( typeof arg === 'string' ) {
      argStr = '\'' + arg + '\'';
    }
    else if ( typeof arg === 'function' ) {
      argStr = arg.toString();
    }
    else {
      argStr = JSON.stringify();
    }
    argsArray.push(argStr);
  }
  var str = ';(' + func.toString() + '(' + argsArray.join(',') + '));';
  return str
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ');
};


// function loadData(url, data, callback){
//   var id = 'temp_' + +new Date();
//   window[id] = function(data){
//     callback(data);
//     onComplete();
//   };
//   var onComplete = function(){
//     var elem = document.getElementById(id);
//     elem.parentNode.removeChild(elem);
//     if ( window[id] ) {
//       delete window[id];
//     }
//   };
//   var scriptEl = createEl('script', {
//     id: id,
//     src: getUrl(url, extendObj({ callback: id }, data)),
//     onerror: onComplete
//     }
//   });
//   document.body.appendChild(scriptEl);
// };


function loadData(url, data, onSuccess, onError){
  var request = new XMLHttpRequest();
  var getUrl = (url, data){
    return url + ( data ? '?' + param(data) : '' );
  };
  var onComplete = function(e){
    if ( e.statusText === 'OK' ) {
      onSuccess && onSuccess(e);
    }
    else {
      onError && onError(e);
    }
  };
  request.open(
    params.type || 'GET',
    getUrl(url, data),
    true
  );
  request.onreadystatechange = params.complete
    ? params.complete
    : onComplete;
  request.send();
};

function param(obj){
  var result = [];
  for ( var key in obj ) {
    result.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
  }
  return result.join('&');
};





/*
 * Page JS
 */


function createEl(tagName, attributes){
  var elem = document.createElement(tagName);
  if ( attributes ) {
    for ( var key in attributes ) {
      elem[key] = attributes[key];
    }
  }
  return elem;
};

function addEvent(elements, eventNames, callback, context){
  eventNames = eventNames.split(' ');
  callback = !context
    ? callback
    : function(){
      callback.apply(context, arguments);
    };
  elements.forEach(function(element){
    eventNames.forEach(function(eventName){
      element.addEventListener(eventName, callback);
    });
  });
};

function selectText(elem) {
  var range = document.createRange();
  range.selectNode(elem);
  getSelection().addRange(range);
}

function deselectText() {
  getSelection().removeAllRanges();
}

function updateSelectionHtml(selection){
  var selectionNode = selection.baseNode;
  var selectionText = selection.toString();
  var updated = [
    selectionNode.nodeValue.substr(0, selection.anchorOffset),
    '<selectiontext>' + selectionText + '</selectiontext>',
    selectionNode.nodeValue.substr(selection.focusOffset)
  ];
  return updated.join('');
};

function restoreSelectionHtml(selectionEl){
  var selectionText = document.createTextNode(selectionEl.innerHTML);
  selectionEl.parentNode
    .insertBefore(selectionText, selectionEl)
    .removeChild(selectionEl);
};

function getTextNodes(elem){
  var textNodes = [];
  var testNode = function(node){
    return node.nodeType === 3 && /[a-zа-я]/i.test(node.nodeValue);
  };
  elem.childNodes.forEach(function(node){
    if ( testNode(node) ) {
      textNodes.push(node);
    }
  });
  return textNodes;
};

function getWordsHtml(wordsText){
  return wordsText
    .replace(/(^|(?:[^a-zа-я]+))([a-zа-я]{2,})/igm, '$1<word>$2</word>');
};

function getWordsText(wordsHtml){
  return wordsText
    .replace(/<\/?word>/igm, '');
};

function wrapWords(event){
  var textNodes = getTextNodes(event.target);
  textNodes.forEach(function(node){
    var textParentEl = node.parentNode;
    var wordEl = createEl('textnode', {
      innerHTML: getWordsHtml(node.nodeValue)
    });
    textParentEl
      .insertBefore(wordEl, node)
      .removeChild(node);
  });
};

function unwrapWords(event){
  var textNodes = event.target.getElementsByTagName('textnode');
  textNodes.forEach(function(node){
    var textParentEl = node.parentNode;
    var word = document.createTextNode(getWordsText(node.innerHTML));
    textParentEl
      .insertBefore(wordEl, node)
      .removeChild(node);
  });
};

function wrapSelection(event){
  if ( event.keyCode === keyCodes.T && event.shiftKey ) {
    var selection = getSelection();
    if ( /[a-zа-я]/i.test(selection.toString()) ) {
      var parentEl = selection.baseNode.parentNode;
      var selectionEl;
      parentEl.innerHTML = updateSelectionHtml(selection);
      selectionEl = parentEl.getElementsByTagName('selectiontext')[0];
      selectText(selectionEl);
    }
  }
};

function unwrapSelection(event){
  if ( event.type === 'click' || (event.type === 'keydown' && event.keyCode === keyCodes.TAB) ) {
    var selections = document.getElementsByTagName('selectiontext');
    selections.forEach(restoreSelectionHtml);
  }
};

var keyCodes = {
  T: 84,
  TAB: 9
};

createEl('word');
createEl('textnode');
createEl('selectiontext');

addEvent(document.body, 'mouseover', wrapWords);
addEvent(document.body, 'mouseout', unwrapWords);
addEvent(document.body, 'keypress', wrapSelection);
addEvent(document.body, 'click keydown', unwrapSelection);
