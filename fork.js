(function(global,undefined){ // eslint-disable-line no-shadow-restricted-names wrap-iife
	"use strict";
	var nfid = 0,
		forks = [],
		Worker = typeof window === "undefined" ? require('webworker-threads').Worker : window.Worker,
		defaults = {
			interval: 1000,
			paused: false,
			description: '',
			type: 'interval',
			onrun: function(){},
			signal: 'run'
		},
		hash = function(str){
			var h = 0,
				i;
			for(i in str){
				if(!isNaN(i)){
					h += str.charCodeAt(i);
				}
			}
			return h;
		},
		URL =  typeof window !== "undefined" ? window.URL || window.webkitURL : null,
		Fork = function(fn,options){ // eslint-disable-line complexity
			var i,
				t = this,
				n = function(){
					if(!options.paused){
						fn.call(options.signal);
						options.signal = 'run';
					}
				},
				splice = function(fid){
					for(var i in forks){
						if(forks[i].fid === fid){
							forks.splice(i,1);
						}
					}
				};
			for(i in defaults){ // eslint-disable-line guard-for-in
				if(options[i] === undefined){
					options[i] = defaults[i];
				}
			}
			t.name = '[Fork-'+hash(fn+'')+']';
			t.destroy = function(){ // eslint-disable-line complexity
				for(var i in t){ // eslint-disable-line guard-for-in
					try{
						delete t[i];
					}catch(e){
						try{
							t[i] = undefined;
						}catch(ee){} // eslint-disable-line no-empty
					}
				}
				try{
					t = undefined;
				}catch(ee){} // eslint-disable-line no-empty
			};
			switch(options.type){
				case 'worker':
					var src = `var fn = ${fn},
							paused = true;
						onmessage = function(e){
							switch(e.data){
								case "stop":
									self.close();
								case "pause":
									paused = true;
								break;
								case "resume":
									paused = false;
								break;
								case "start":
									paused = false;
								default:
									fn(e.data);
								break;
							}
						};`;
					if(URL){
						fn = URL.createObjectURL(new Blob([src]));
					}else{
						fn = new Function(src); // eslint-disable-line no-new-func
					}
					t.start = function(){
						t.worker = new Worker(fn);
						t.worker.onmessage = function(e){
							options.onrun(e.data);
						};
						options.paused = false;
						t.worker.postMessage('start');
						t.iid = setInterval(function(){
							t.worker.postMessage(options.signal);
							options.signal = 'run';
						},options.interval);
					};
					t.stop = function(){
						t.worker.postMessage('stop');
						t.worker.terminate();
						clearInterval(t.iid);
						options.paused = true;
					};
					t.pause = function(){
						t.worker.postMessage('pause');
						options.paused = true;
					};
					t.resume = function(){
						t.worker.postMessage('resume');
						options.paused = false;
					};
					t.restart = function(){
						t.stop();
						t.start();
					};
					t.kill = function(){
						t.stop();
						if(URL){
							URL.revokeObjectURL(fn);
						}
						splice(t.fid);
						t.destroy();
					};
				break;
				default:
					t.pause = function(){
						options.paused = true;
					};
					t.resume = function(){
						options.paused = false;
					};
					t.stop = function(){
						clearInterval(t.iid);
						t.pause();
					};
					t.start = function(){
						t.iid = setInterval(n,options.interval);
						t.resume();
					};
					t.restart = function(){
						t.stop();
						t.start();
					};
					t.kill = function(){
						t.stop();
						splice(t.fid);
						t.destroy();
					};
				break;
			}
			t.signal = function(signal){
				options.signal = signal;
			};
			t.interval = function(interval){
				options.interval = interval;
				t.restart();
			};
			t.option = function(name,val){
				if(val === undefined){
					return options[name];
				}else if(name !== 'interval'){
					options[name] = val;
				}
			};
			t.start();
		},
		Forks = {
			fork: function(fn,options){
				var i = forks.push(new Fork(fn,options));
				forks[i-1].fid = ++nfid;
				return forks[i-1];
			},
			get: function(fid){
				for(var i in forks){
					if(forks[i].fid === fid){
						return forks[i];
					}
				}
				return false;
			},
			list: function(){
				var i,r = [];
				for(i in forks){
					if(!isNaN(i)){
						r.push(forks[i].fid);
					}
				}
				return r;
			},
			killall: function(){
				for(var i in forks){
					if(!isNaN(i)){
						forks[i].kill();
					}
				}
			}
		};
	if(typeof module !== 'undefined' && module.exports){
		module.exports = {
			Fork: Fork,
			Forks: Forks
		};
	}else{
		global.Fork = Fork;
		global.Forks = Forks;
	}
})(typeof global !== "undefined" ? global : window);