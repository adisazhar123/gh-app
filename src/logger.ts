import winston from "winston";

export const log = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'HH:mm:ss.SSS'
    }),
    winston.format.colorize({
      all: true,
    }),
    // @ts-ignore
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
  ),
  transports: [
    new winston.transports.Console(),
  ],
});