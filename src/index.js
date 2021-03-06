import express from "express";
import bodyParser from 'body-parser';
import web from "./routes/web";
require('dotenv')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

web(app);

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log("Server is running on port 8000");
});