"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubClient = void 0;
const axios_1 = __importDefault(require("axios"));
exports.githubClient = axios_1.default.create({
    baseURL: '',
    timeout: 10000
});
exports.githubClient.interceptors.request.use(function (config) {
    console.log('request config', config);
    return config;
}, function (error) {
    return Promise.reject(error);
});
exports.githubClient.interceptors.response.use(function (response) {
    console.log('response', response);
    return response;
}, function (error) {
    return Promise.reject(error);
});
