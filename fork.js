(function(window,undefined){
	"use strict";
	var nfid = 0,
		forks = [],
		defaults = {
			interval: 1000,
			paused: false,
			description: ''
		},
		hash = function(str){
			var h = 0,
				i;
			for(i in str){
				h += str.charCodeAt(i);
			}
			return h;
		},
		Fork = function(fn,options){
			var i,
				t = this,
				n = function(){
					if(!options.paused){
						fn.call(t);
					}
				};
			for(i in defaults){
				if(options[i] === undefined){
					options[i] = defaults[i];
				}
			}
			t.name = '[Fork-'+hash(fn+'')+']';
			t.iid = setInterval(n,options.interval);
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
			t.interval = function(interval){
				options.interval = interval;
				t.restart();
			};
			t.kill = function(){
				t.stop();
				for(var i in forks){
					if(forks[i].fid == t.fid){
						forks.splice(i,1);
					}
				}
			};
			t.option = function(name,val){
				if(val === undefined){
					return options[name];
				}else if(name != 'interval'){
					options[name] = val;
				}
			};
		};
	window.forkManager = {
		fork: function(fn,options){
			var i = forks.push(new Fork(fn,options));
			forks[i-1].fid = ++nfid;
		},
		get: function(fid){
			for(var i in forks){
				if(forks[i].fid == fid){
					return forks[i];
				}
			}
			return false;
		},
		list: function(){
			var i,r = [];
			for(i in forks){
				r.push(forks[i].fid);
			}
			return r;
		}
	};
})(window);