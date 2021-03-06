require('dotenv').config();
import request from 'request';

const PAGE_ACCESS_TOKEN = process.env.MY_VERIFY_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const getHomePage = (req, res) => {
  res.send("Hello");
}

const receiveEvent = (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the body of the webhook event
      // console.log(entry);
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      console.log('msg:', webhook_event.message);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(webhook_event);
      } else if (webhook_event.postback) {
        handlePostback(webhook_event);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

}

const verifyWebhook = (req, res) => {
  // Your verify token. Should be a random string.

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
}

function handleMessage(webhook_event) {
  // Sends the response message
  // callSendAPI(sender_psid, response); 
  callSendAPIToServer(webhook_event);
}

// Handles messaging_postbacks events
function handlePostback(webhook_event) {

}


// Sends response messages via the Send API
const callSendAPI = (req, response) => {
  // Send the HTTP request to the Messenger Platform
  console.log(JSON.stringify(req.body))
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": req.body
  }, (err, res, body) => {
    if (!err) {
      console.log('sent msg successfully!'+ JSON.stringify(body))
      response.status(200).send(body)
    } else {
      console.error("Unable to send message:" + err);
      response.status(200).send(res)
    }
  });
}

// Sends messages to the Server
async function callSendAPIToServer(webhook_event) {
  const sender_psid = webhook_event.sender.id;
  const recipient_psid = webhook_event.recipient.id;
  const time_of_message = webhook_event.timestamp;
  const message = webhook_event.message;
  var attachments = message.attachments;


  const senderInfo = await getUserInfo(sender_psid);

  const request_body = {
    "senderId": sender_psid,
    "recipientId": recipient_psid,
    "message": message.text,
    "timeOfMessage": time_of_message,
    "senderInfo": senderInfo
  }

  if (attachments) {
    request_body.attachments = attachments;
  };


  request({
    "uri": "https://social-sales-helper.herokuapp.com/api/facebook/messages/event",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

async function getUserInfo(sender_psid) {
  return new Promise(function (resolve, reject) {
    request({
      "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic`,
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "GET",
    }, (err, res, body) => {
      if (!err) {
        let response = JSON.parse(body);
        let user_name = `${response.first_name} ${response.last_name}`;
        let profile_pic = response.profile_pic;
        let id = response.id;
        let userInfo = { user_name, profile_pic, id };
        console.error("user info:" + response);
        resolve(userInfo);
      } else {
        reject(error);
      }
    });
  });
}


export default {
  getHomePage: getHomePage,
  receiveEvent: receiveEvent,
  verifyWebhook: verifyWebhook,
  callSendAPI: callSendAPI
}

