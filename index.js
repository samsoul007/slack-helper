const rp = require('request-promise');

const oConfig = {};
const sEndpoint = "https://slack.com/api/";

const addConfig = function() {
  let sName = "default", sBotName, sToken = false;

  if(arguments.length < 2){
    throw new Error("Slack config require a token and a botname")
  }

  if (arguments.length == 2) {
    if (oConfig["default"])
      return;

    sToken = arguments[0];
    sBotName = arguments[1];
  } else {
    if (oConfig[arguments[0]])
      return;

    sName = arguments[0];
    sToken = arguments[1];
    sBotName = arguments[2] ||  sBotName;
  }

  oConfig[sName] = {
    token:sToken,
    botname: sBotName
  };
}

const onErrorMethod = function(err) {
  return err;
};

const serialize = function(p_oObject){
  var str = [];
  for (var p in p_oObject)
    if (p_oObject.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(p_oObject[p]));
    }

  return str;
}

const generateQueryString = function(p_oProfile,p_oObject){
    return [].concat(serialize(p_oProfile),serialize(p_oObject || {})).join("&")
}

const processSlackResponse = function(response){
  if(response.error)
    return Promise.reject(response.error)

  return response;
}


const Slack = function() { // eslint-disable-line func-names
  this.oChannels = false;
  this.onErrorMethod = onErrorMethod;
  this.sProfile = "default";
  this.sChannel = false;
};

Slack.prototype = {
  use(p_sProfile){
    if(!oConfig[p_sProfile])
      throw new Error(`Slack config ${p_sProfile} does not exists`)

    this.sProfile = p_sProfile;
    return this;
  },
  onError : function(p_fFunction){
    this.onErrorMethod = p_fFunction;
    return this;
  },
  channel(p_sName){
    this.sChannel = p_sName;
    return this;
  },
  init() {
    const self = this;
    if (self.oChannels) return Promise.resolve(self.oChannels);

    return Promise.all([
      this.channels(),
      this.groups()
    ])
    .then(function(arroResults){
      self.oChannels = {};
      for(var i = 0 ; i < arroResults.length; i++){
        var arroSpecResults = arroResults[i]
        for(var j = 0 ; j < arroSpecResults.length; j++){
          self.oChannels[arroSpecResults[j].name] = arroSpecResults[j].id;
        }
      }
      return self.oChannels;
    })
  },
  post(p_sMessage, p_attachment) {
    const self = this;
    return self.init()
      .then((oChannels) => {
        if(!self.sChannel){
          return Promise.reject(`no channel set, use channel()`);
        }

        if (!oChannels[self.sChannel]) {
          return Promise.reject(`could not find channel: ${self.sChannel}`);
        }

        if (p_attachment) {
          const oRequest = {
            channels : oChannels[self.sChannel],
            filetype : "javascript",
            filename : "error.json",
            title : p_sMessage
          }

          const oObj = {
            content: JSON.stringify(p_attachment, null, '\t'),
          };

          return rp({
            method: 'POST',
            uri: sEndpoint + `files.upload?` + generateQueryString(oConfig[self.sProfile],oRequest),
            form: oObj,
            json: true
          });
        } else {
          const oRequest = {
            channel : oChannels[self.sChannel],
            text: p_sMessage
          }

          return rp({
              method: 'GET',
              uri: sEndpoint + `chat.postMessage?` + generateQueryString(oConfig[self.sProfile],oRequest),
              json: true
            })
        }
      })
      .then(processSlackResponse)
      .then(function(resp) {
        return true;
      })
      .catch(function(err) {
        return Promise.reject(self.onErrorMethod(err))
      })
  },
  channels() {
    return rp({
        method: 'GET',
        uri: sEndpoint + `channels.list?`+ generateQueryString(oConfig[this.sProfile]),
        json: true
      })
      .then(processSlackResponse)
      .then((oResponse) => (oResponse.ok ? oResponse.channels : []))
  },
  groups() {
    return rp({
        method: 'GET',
        uri: sEndpoint + `groups.list?`+ generateQueryString(oConfig[this.sProfile]),
        json: true
      })
      .then(processSlackResponse)
      .then((oResponse) => (oResponse.ok ? oResponse.groups : []))
  },
};



const oObjExport = function(){
  // return new Slack()
}

const msg = function(p_sChannel) {
  const oSlack = new Slack();
  return oSlack.channel(p_sChannel);
}

module.exports = {
  onError(p_fFuntion) {
    onErrorMethod = p_fFuntion;
  },
  addConfig: addConfig,
  msg: msg,
  message: msg
}
