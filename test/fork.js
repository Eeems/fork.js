var test = require('tape'),
	lib = require('../index.js'),
	Fork = lib.Fork,
	Forks = lib.Forks;

test('Fork',function(t){
	var d = new Date(),
		nd = new Date(),
		fork = Forks.fork(function(){
			nd = new Date();
		},{
			description: 'test hook',
			interval: 1
		}),
		fid = fork.fid;
	t.ok(fork instanceof Fork,'Creation');
	fork.pause();
	t.ok(fork.option('paused'),'Pausing');
	fork.resume();
	t.notOk(fork.option('paused'),'Resuming');
	fork.stop();
	d = nd;
	setImmediate(function(){
		t.ok(fork.option('paused'),'Stopping 1/2');
		t.equals(d,nd,'Stopping 2/2');
		d = nd;
		fork.start();
		setImmediate(function(){
			t.notOk(fork.option('paused'),'Starting 1/2');
			t.notEquals(nd,d,'Starting 2/2');
			fork.kill();
			t.equals(fork.name,undefined,'Kill 1/3');
			d = nd;
			setImmediate(function(){
				t.equals(nd,d,'Kill 2/3');
				t.notOk(Forks.get(fid),'Kill 3/3');
				t.end();
				test('Worker Fork',function(t){
					var d = new Date(),
						nd = new Date(),
						fork = Forks.fork(function(){
							postMessage(new Date());
						},{
							description: 'test hook',
							type: 'worker',
							interval: 1,
							onrun: function(d){
								nd = new Date(d);
							}
						}),
						fid = fork.fid;
					t.ok(fork instanceof Fork,'Creation');
					fork.pause();
					t.ok(fork.option('paused'),'Pausing');
					fork.resume();
					t.notOk(fork.option('paused'),'Resuming');
					fork.stop();
					d = nd;
					setImmediate(function(){
						t.ok(fork.option('paused'),'Stopping 1/2');
						t.equals(d,nd,'Stopping 2/2');
						d = nd;
						fork.start();
						setTimeout(function(){
							t.notOk(fork.option('paused'),'Starting 1/2');
							t.notEquals(nd,d,'Starting 2/2');
							fork.kill();
							t.equals(fork.name,undefined,'Kill 1/3');
							d = nd;
							setImmediate(function(){
								t.equals(nd,d,'Kill 2/3');
								t.notOk(Forks.get(fid),'Kill 3/3');
								t.end();
							});
						}, 100);
					});
				});
			});
		});
	});
});
