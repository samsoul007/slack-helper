


# slack-helper
<!-- [![npm version](https://badge.fury.io/js/elasticsearch-helper.svg)](https://badge.fury.io/js/elasticsearch-helper) [![NSP Status](https://nodesecurity.io/orgs/jacques-sirot/projects/60dd35a8-0efd-415e-9f72-2e7300f888ef/badge)](https://nodesecurity.io/orgs/jacques-sirot/projects/60dd35a8-0efd-415e-9f72-2e7300f888ef) -->

A Nodejs module facilitating Slack messaging.

<img src="https://assets.brandfolder.com/c8d4sd15/original/slack_rgb.png" width="200" />

# installation

`npm install --save slack-msg-helper`

# usage

## Add client

```javascript
const SL = require("slack-helper")

// Will create a default config
SL.addConfig("token","botname");

// Will create a config with name "slack1"
SL.addConfig("slack1","token","botname");

```

## Use client

The client is chainable which means that you can call functions one after the other until you execute the posting. It then returning a promise.

Initialise a post:

```javascript
// Creating message to group or channel called "my-channel"
SL.message("my-channel");

// Creating message to group or channel called "my-channel" using the config "slack1"
SL.message("my-channel").use("slack1")
```

## Posting

For those example we will use the query variable 'slack':

```javascript
// initialise query
const myChannel = SL.message("my-channel");
```

### Simple message

```javascript
myChannel.post("my message");
```

### Message with JSON attachement

```javascript
myChannel.post("my message", {...});
```
