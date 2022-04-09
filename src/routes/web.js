import express from "express";

let router = express.Router();

const web = (app) => {
    router.get('/',(req,res)=> {
        res.send('Landing');
    })

    return app.use('/', router);
};

export default web;