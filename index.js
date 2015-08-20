var JSZip = require("jszip");
var fs = require('fs');
var moment = require('moment');
var request = require('request');
var _ = require('lodash');

var cwd = process.cwd();

function normalizePath(to, root){
  if (!to){
    to = '/';
  }else if(to[0] === '.'){
    to = fis.util(cwd + '/' +  to);
  } else if(/^output\b/.test(to)){
    to = fis.util(root + '/' +  to);
  }else {
    to = fis.util(to);
  }
  return to;
}

module.exports = function(files, settings, callback){
  if(!fis.util.is(settings, 'Array')){
    settings = [settings];
  }
  var conf = {};
  settings.forEach(function(setting){
    fis.util.merge(conf, setting);
  });

  var name = fis.config.get('name') || 'scrat-project';
  var version = fis.config.get('version');

  conf.file = conf.file || ('../dist/' + name + (version ? '_v' + version : '') + '_' + moment().format('YYYYMMDDHHmmss') + '.zip');

  var targetPath = normalizePath(conf.file, fis.project.getProjectPath());
  if(!fis.util.exists(targetPath)){
    fis.util.mkdir(fis.util.pathinfo(targetPath).dirname);
  }
  var zip = new JSZip();
  files.filter(function(fileInfo){
    return !conf['onlyPublic'] || fileInfo.dest.release.match(/^\/public/);
  }).forEach(function(fileInfo){
    var file = fileInfo.file;
    if(!file.release){
      fis.log.error('unable to get release path of file[' + file.realpath + ']: Maybe this file is neither in current project or releasable');
    }
    var name = fileInfo.dest.release.replace(/^\/*/g, '')
    if(conf['onlyPublic']){
      name = name.replace(/^public/, '');
    }
    zip.file(name, fileInfo.content);
    fis.log.debug('pack file [' + name + ']');
  });

  fis.log.notice('compress to: ' + targetPath);
  fs.writeFileSync(targetPath, zip.generate({type:"nodebuffer"}));

  //上传
  if(conf.url){
    var formData = {};
    formData[conf.uploadField] = fs.createReadStream(targetPath);

    //TODO: collect git commit
    //TODO: support auth prompt
    //TODO: support prompt cache

    var requestConfig = _.merge({
      json: true,
      formData: formData
    }, conf);

    fis.log.notice('upload to: ' + conf.url);
    request.post(requestConfig, function (err, response, body) {
      if (err || body.error || body.sucess === false) {
        return fis.log.error('upload fail: ' + JSON.stringify(err || body));
      }else{
        fis.log.notice('upload done, server responded with: ' + JSON.stringify(body));
      }
    });
  }
};

module.exports.fullpack = true;