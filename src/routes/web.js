import express from "express";

import ChatBotController from '../controllers/ChatBotController';
let router = express.Router();

const web = (app) => {
    router.get('/',ChatBotController.getHomePage)

    // Creates the endpoint for our webhook 
    app.get('/webhook', ChatBotController.verifyWebhook);
    app.post('/webhook', ChatBotController.receiveEvent);
    app.post('/callSendAPI', ChatBotController.callSendAPI);

    return app.use('/', router);
};

export default web;