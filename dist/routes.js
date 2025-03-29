"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const webhook_events_1 = require("./webhook-events");
const router = express_1.default.Router();
router.post('/webhook', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const event = `${req.header('x-github-event')}.${req.body.action}`;
    if (event == 'pull_request.opened') {
        const user = req.body.pull_request.user;
        console.log('user is', user);
        yield (0, webhook_events_1.PullRequestOpened)(req.body);
    }
    // console.log('in webhook', req.body);
    // console.log('headers', req.headers);
    res.send('OK');
}));
exports.default = router;
