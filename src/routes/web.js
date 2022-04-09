import express from "express";

import ChatBotController from '../controllers/ChatBotController';
let router = express.Router();

const web = (app) => {
    router.get('/',ChatBotController.getHomePage)

    // Creates the endpoint for our webhook 
    app.post('/webhook', ChatBotController.receiveEvent);
    app.get('/webhook', ChatBotController.verifyWebhook);

    return app.use('/', router);
};

export default web;