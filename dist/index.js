"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const smee_client_1 = __importDefault(require("smee-client"));
const routes_1 = __importDefault(require("./routes"));
const bodyParser = require('body-parser');
const winston = require('winston'), expressWinston = require('express-winston');
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const smee = new smee_client_1.default({
    source: process.env.SMEE_SOURCE || '',
    target: `http://localhost:${port}/webhook`
});
const events = smee.start();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp({
                format: 'HH:mm:ss.SSS'
            }), winston.format.colorize({
                all: true,
            }), 
            // @ts-ignore
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}` + (info.splat !== undefined ? `${info.splat}` : " ")))
        })
    ],
    expressFormat: true,
    meta: false,
    colorize: true,
}));
app.use(routes_1.default);
app.get("/", (req, res) => {
    res.send("OK");
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.render('error', { error: err });
}
app.use(errorHandler);
