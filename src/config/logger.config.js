import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";
import os from "os";

const logDir = "logs";
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

winston.addColors({
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
});

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level}]: ${stack || message}`;
    })
);

const initLogger = () => {
    return winston.createLogger({
        levels: {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            debug: 4,
        },
        defaultMeta: {
            service: "tagih-id-service",
            pid: process.pid,
            hostname: os.hostname(),
        },
        level: process.env.LOGGER_LEVEL || "info",
        transports: [
            new DailyRotateFile({
                filename: path.join(logDir, "%DATE%.log"),
                datePattern: "YYYY-MM-DD",
                maxSize: "20m",
                maxFiles: "14d",
                zippedArchive: true,
                format: fileFormat,
            }),
            new winston.transports.Console({
                format: consoleFormat,
            }),
        ],
        exitOnError: false,
    });
};

const logger = initLogger();
export default logger;
