import express from "express";
import {PullRequestOpened} from "./webhook-events";

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const event = `${req.header('x-github-event')}.${req.body.action}`;
  if (event == 'pull_request.opened') {
     const user = req.body.pull_request.user;
     console.log('user is', user);

    await PullRequestOpened(req.body);
  }
  // console.log('in webhook', req.body);
  // console.log('headers', req.headers);
  res.send('OK');
});

export default router;