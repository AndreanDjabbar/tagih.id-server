import pino from 'pino';
import path from 'path';
import fs from 'fs';

const logDirectory = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const transport = pino.transport({
    targets: [
        {
            target: 'pino-roll',
            options: {
                file: path.join(logDirectory, 'app'),
                frequency: 'daily',
                extension: '.log',
                dateFormat: 'yyyy-MM-dd',
                limit: { count: 7 }
            },
            level: process.env.LOG_LEVEL || 'info'
        },
        {
            target: 'pino-pretty',
            options: {
                translateTime: 'SYS:yyyy-MM-dd HH:MM:ss',
                ignore: 'pid,hostname',
                singleLine: true
            },
            level: process.env.LOG_LEVEL || 'info'
        }
    ]
});

export const logger = pino(
    {
        level: process.env.LOG_LEVEL || 'info'
    },
    transport
);