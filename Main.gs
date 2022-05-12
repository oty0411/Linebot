var CHANNEL_ACCESS_TOKEN = 'uCjNx+OxXim17UN5GJIcuaFAq26UN1olIZwb8fprkCm54boKffFrKbAhl/n0nzeeZNG7BOjboL1AfHcXjzV0RUhvOuoZimnUY//KwJASavJ2dLdZ75g/sIiFoI8YlBHzVPIjm58VpVw5s78ooEbJjwdB04t89/1O/w1cDnyilFU=';
var LINE_ENDPOINT = 'https://api.line.me/v2/bot/message/reply';
var simple_wikipedia_api = 'https://ja.wikipedia.org/w/api.php';
const TEST_MODE = false;

function doPost(e) {
  if (!TEST_MODE) {
    var replyToken= JSON.parse(e.postData.contents).events[0].replyToken;
    if (typeof replyToken === 'undefined') {
      return;
    }
  }
  
  /**** logic start *****************************************/
  
  var user_message = TEST_MODE ? "水" : JSON.parse(e.postData.contents).events[0].message.text;
  
  var messages = "";

  messages = getWiki(user_message);
  console.log(messages);

  /**** logic end *****************************************/
  if (!TEST_MODE) {
    UrlFetchApp.fetch(LINE_ENDPOINT, {
      'headers': {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
      },
      'method': 'post',
      'payload': JSON.stringify({
        'replyToken': replyToken,
        'messages': messages,
      }),
    });
    return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
  }
}

/* === logical functions ============================== */

function getWiki(user_message) {
  var reply_messages = ['この映画本当に最高のEMOEMOだったわ〜'];
  var url_and_body = getWikipediaUrlAndBody(user_message);
  if (url_and_body !== null) {
    reply_messages = [
      'ちょっと待ってね〜今探してるわ〜 ' + '「' + user_message + '」',
      url_and_body.body.substr(0, 140) + '...',
      '続きは下記リンク',
      url_and_body.url,
    ];
  }

  return reply_messages.map(function (v) {
    return {'type': 'text', 'text': v};
  });
}

function getWikipediaUrlAndBody(q) {
  var url = simple_wikipedia_api + '?format=json&action=query&prop=extracts&exintro&explaintext&titles=' + encodeURIComponent(q);
  var res = JSON.parse(UrlFetchApp.fetch(url).getContentText());

  for (let id in res.query.pages) {
    // 検索語句にヒットしない場合は id が -1
    if(id > 0){
      return {'url': "https://ja.wikipedia.org/w/index.php?curid=" + res.query.pages[id].pageid, 'body': res.query.pages[id].extract};
    }
  }
  return null;
}
