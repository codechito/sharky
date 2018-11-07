"use strict";

const EventEmitter = require('events');
const uuidv4 = require('uuid/v4');

class AppEmitter extends EventEmitter {}

let emitter = new AppEmitter();

emitter.invokeHook = function(hn,options){
  console.log(hn);
	let ctrRspns = 0;
	let responses = [];
  let errors = [];
  if(!options){
    options = {};
  }
	options.uid = uuidv4();	
	return new Promise(function(resolve, reject) {
    emitter.on(hn + '_response_' + options.uid,function(err,response){
      let cntLsnr = emitter.listenerCount(hn + '_request');
      ctrRspns++;
      
      if(response){
        responses.push(response);
      }
      if(err){
        errors.push(err);
      }
      if(ctrRspns >=cntLsnr){
        emitter.removeAllListeners([hn + '_response_' + options.uid]);    
        if(errors.length){
          reject(errors);
        }
        if(responses.length){
          resolve(responses);
        }
      }      
    });    
    emitter.emit(hn + '_request',options);
  });

};

emitter.registerHook = function(hn,fn){
	emitter.on(hn + '_request',function(options){
    let p = fn(options);
		p.then(function(content) {
      emitter.emit(hn + '_response_' + options.uid,null,content);
    }, function(err) {
      emitter.emit(hn + '_response_' + options.uid,err);
    });

	});
};

module.exports = emitter;