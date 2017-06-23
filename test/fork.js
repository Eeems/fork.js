var test = require('tape'),
	lib = require('../index.js'),
	Fork = lib.Fork,
	Forks = lib.Forks;
test('Fork',function(t){
	var date = new Date(),
		newDate = new Date(),
		fork = Forks.fork(function(){
			newDate = new Date();
		},{
			description: 'test hook',
			interval: 1
		}),
		fid = fork.fid;
	t.ok(fork instanceof Fork, 'Creation');
	fork.pause();
	t.ok(fork.option('paused'), 'Pausing');
	fork.resume();
	t.notOk(fork.option('paused'), 'Resuming');
	fork.stop();
	date = newDate;
	setTimeout(function(){
		t.ok(fork.option('paused'), 'Stopping 1/2');
		t.equals(date, newDate, 'Stopping 2/2');
		date = newDate;
		fork.start();
		setTimeout(function(){
			t.notOk(fork.option('paused'), 'Starting 1/2');
			t.notEquals(newDate, date, 'Starting 2/2');
			fork.kill();
			t.equals(fork.name, undefined, 'Kill 1/3');
			date = newDate;
			setTimeout(function(){
				t.equals(newDate, date, 'Kill 2/3');
				t.notOk(Forks.get(fid),'Kill 3/3');
				t.end();
			}, 200);
		}, 200);
	}, 200);
});
test('Worker Fork', function(t){
	var date = new Date(),
		nd = new Date(),
		fork = Forks.fork(function(){
			postMessage(new Date());
		}, {
			description: 'test hook',
			type: 'worker',
			interval: 1,
			onrun: function(date){
				nd = new Date(date);
			}
		}),
		fid = fork.fid;
	t.ok(fork instanceof Fork, 'Creation');
	fork.pause();
	t.ok(fork.option('paused'), 'Pausing');
	fork.resume();
	t.notOk(fork.option('paused'), 'Resuming');
	fork.stop();
	date = nd;
	setTimeout(function(){
		t.ok(fork.option('paused'), 'Stopping 1/2');
		t.equals(date, nd, 'Stopping 2/2');
		date = nd;
		fork.start();
		setTimeout(function(){
			t.notOk(fork.option('paused'), 'Starting 1/2');
			t.notEquals(nd, date, 'Starting 2/2');
			fork.kill();
			t.equals(fork.name, undefined, 'Kill 1/3');
			date = nd;
			setTimeout(function(){
				t.equals(nd, date, 'Kill 2/3');
				t.notOk(Forks.get(fid), 'Kill 3/3');
				t.end();
			}, 200);
		}, 200);
	}, 200);
});
