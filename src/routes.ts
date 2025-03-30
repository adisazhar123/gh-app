import express from "express";
import {PullRequestOpened} from "./webhook-events";
import {logger} from "./logger";

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const event = `${req.header('x-github-event')}.${req.body.action}`;
  logger.info(`received event: ${event}`);
  if (event == 'pull_request.opened') {
    await PullRequestOpened(req.body);
  }
  res.send('OK');
});

export default router;