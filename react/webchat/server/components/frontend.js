'use strict';

var version = require('../../dist/version.json');
var config = require('../config.js');
var path = require('path');

var debug = config.debug;

class FrontEnd {
    static getDomain() {
        if (debug) {
            return '/static/mh5';
        } else {
            return 'http://res1.kezhanwang.cn/static/mh5';
        }
    }

    static singleton() {
        if (!this.__instance) {
            this.__instance = new this();
        }

        return this.__instance;
    }

    static getHashFileName(filename, folder) {
        if (!filename) 
            return;
        if (debug) {
            return filename;
        } else {
            var basename = filename.split('.')[0];
            var ext = filename.split('.')[1];

            var hash = this.getHash(basename, folder, ext);
            if (hash) {
                return basename + '_' + hash + '.' + ext;
            } else {
                return basename + '.' + ext;
            }
        }
    }

    static getHash(filename, folder, ext) {
        if (!filename) 
            return;
        if (debug) {
            return '';
        } else {
            if (!ext) {
                switch (folder) {
                    case 'js':
                        ext = 'js';
                        break;

                    case 'css':
                        ext = 'css';
                        break;

                    case 'images':
                        ext = 'png';
                        break;
                }
            }

            return version['/mh5/' + folder + '/' + filename + '.' + ext] || '';
        }
    }

    static getUrl(filepath) {
        var vfilepath = filepath.replace('/static', '');

        if (vfilepath in version) {
            var hash = version[vfilepath];

            vfilepath = vfilepath.replace('/mh5', '');
            if (debug) {
                return this.getDomain() + vfilepath + '?' + hash;
            } else {
                return this.getDomain() + this.mergeHash(vfilepath, hash);
            }
        } else {
            return filepath;
        }
    }

    static mergeHash(filepath, hash) {
        var parsed = path.parse(filepath);
        parsed.name = parsed.name + '_' + hash;
        parsed.base = parsed.name + parsed.ext;

        return path.format(parsed);
    }
}

module.exports = FrontEnd;
