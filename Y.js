/**
 * @author yu
 * @license http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

var StringHelper = require('./helpers/StringHelper');

/**
 * 辅助类
 */
class Y {
    
    /**
     * @ 别名路径转换真实路径
     *
     * @param {String} alias 路径别名
     * @return {String} 路径
     */
    static getPathAlias(alias) {
        if('@' !== alias.charAt(0)) {
            return alias;
        }

        // 截取开头作为别名
        var pos = alias.indexOf('/');
        var root = -1 === pos ? alias : alias.substring(0, pos);
        if(undefined !== Y.pathAliases[root]) {
            return -1 === pos ?
                Y.pathAliases[root] :
                Y.pathAliases[root] + alias.substring(pos);
        }

        return '';
    }
    
    /**
     * 设置路径别名
     *
     * @param {String} alias 路径别名
     * @param {String} path 路径
     */
    static setPathAlias(alias, path) {
        if('@' !== alias.charAt(0)) {
            alias = '@' + alias;
        }

        if(null === path) {
            delete Y.pathAliases[alias];
            
            return;
        }
        
        Y.pathAliases[alias] = StringHelper.rTrimChar(path, '/');
    }
    
    /**
     * 创建对象 系统类路径约定以 y 开头 应用类以项目目录开头
     *
     * @param {String} clazz 以某个已经定义的别名开头的类全名 eg. y/log/file/Target, app/controllers/index/IndexController
     * @param {Object} params 参数
     * @return {Object} 类实例
     */
    static createObject(clazz, ...params) {
        var realClass = Y.getPathAlias('@' + clazz);
        
        // 文件不存在抛出异常
        // todo
        
        var Obj = require(realClass + Y.fileExtention);
        
        return new Obj(...params);
    }
    
    /**
     * 导入一个类文件
     *
     * @param {String} clazz 类全名
     */
    static include(clazz) {
        var realClass = Y.getPathAlias('@' + clazz);
        
        // 文件不存在抛出异常
        // todo
        
        return require(realClass + Y.fileExtention);
    }
    
    /**
     * 对象配置
     *
     * @param {Object} object 需要配置的对象
     * @param {JSON} propertys 配置项
     * @return {Object} 源对象
     */
    static config(object, propertys) {
        for(let key in propertys) {
            object[key] = propertys[key];
        }
        
        return object;
    }
    
}

/**
 * @var Application 应用实例
 */
Y.app = null;

/**
 * @var JSON 路径别名
 */
Y.pathAliases = {'@y': __dirname};

/**
 * @var String 默认文件扩展名
 */
Y.fileExtention = '.js';

module.exports = Y;
