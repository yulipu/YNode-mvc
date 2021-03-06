/**
 * @author yu
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

const fs = require('fs');

const Y = require('../../Y');
const Logger = require('../Logger');
const ILog = require('../ILog');
const FileHelper = require('../../helpers/FileHelper');
const TimeHelper = require('../../helpers/TimeHelper');

/**
 * 文件日志
 *
 * 'log': {
 *     'targets': {
 *         'file': {
 *             'classPath': 'y/log/file/Log',
 *             'logPath': '@runtime/logs',
 *             'logFile': 'system.log',
 *             'maxFileSize': 10240
 *         }
 *     },
 *     'flushInterval': 10
 * }
 *
 */
class Log extends ILog {

    /**
     * constructor
     */
    constructor(configs) {
        super();

        /**
         * @property {String} absolute path of log file. default at runtime directory of the application
         */
        this.logPath = undefined === configs.logPath
            ? Y.getPathAlias('@runtime/logs')
            : configs.logPath;

        /**
         * @property {String} log file name
         */
        this.logFile = undefined === configs.logFile
            ? 'system.log'
            : configs.logFile;

        /**
         * @property {Number} maxFileSize maximum log file size in KB
         */
        this.maxFileSize = undefined === configs.maxFileSize
            ? 10240
            : configs.maxFileSize;
    }

    /**
     * @inheritdoc
     */
    flush(messages) {
        // 检查目录
        fs.access(this.logPath, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(null === err) {
                this.writeLog(messages);

                return;
            }

            FileHelper.createDirectory(this.logPath, 0o777, (err) => {
                this.writeLog(messages);
            });
        });
    }

    /**
     * 格式化内容
     */
    formatMessage(messages) {
        let msg = '';
        for(let i=0,len=messages.length; i<len; i++) {
            msg += TimeHelper.format('y-m-d h:i:s', messages[i][2])
                + ' [ '
                + Logger.getLevelName(messages[i][1])
                + ' ] '
                + messages[i][0]
                + '\n';
        }

        return msg;
    }

    /**
     * 写日志
     */
    writeLog(messages) {
        let msg = this.formatMessage(messages);
        let file = this.logPath + '/' + this.logFile;

        // check file exists
        fs.access(file, fs.constants.F_OK, (err) => {
            // file not exists
            if(null !== err) {
                fs.writeFile(file, msg, (err) => {});

                return;
            }

            // check file size
            fs.stat(file, (err, stats) => {
                if(stats.size > this.maxFileSize * 1024) {
                    let newFile = file + TimeHelper.format('ymdhis');

                    fs.rename(file, newFile, (err) => {
                        fs.writeFile(file, msg, (err) => {});
                    });

                    return;
                }

                fs.appendFile(file, msg, (err) => {});
            });
        });
    }

}

module.exports = Log;
