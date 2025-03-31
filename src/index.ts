import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import SmeeClient from 'smee-client'
import webhookRoutes from './routes'
import {startBackgroundJobs} from "./webhook-events";
import {logger} from "./logger";
import bodyParser from 'body-parser'
import winston from 'winston';
import expressWinston from 'express-winston';

dotenv.config();

logger.info(`NODE_ENV is ${process.env.NODE_ENV}`);

const app: Express = express();
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'development') {
  new SmeeClient({
    source: process.env.SMEE_SOURCE || '',
    target: `http://localhost:${port}/webhook`,
    logger: logger,
  }).start();
}

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'HH:mm:ss.SSS'
        }),
        winston.format.colorize({
          all: true,
        }),
        // @ts-ignore
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
      )
    })
  ],
  expressFormat: true,
  meta: false,
  colorize: true,
}));

app.use(webhookRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});

app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  logger.error('error occurred', err);
  res.status(500)
  res.render('error', { error: err })
});

startBackgroundJobs();