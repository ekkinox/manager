let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let ContainerListFormatter = require('./src/ContainerListFormatter');
let containerListFormatter = new ContainerListFormatter();

let Docker = require('dockerode');
let docker = new Docker();

let DockerNetworkAnalyzer = require('./src/DockerNetworkAnalyzer');
let dockerNetworkAnalyzer = new DockerNetworkAnalyzer(docker, containerListFormatter);

server.listen(3000);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/manager.js', function (req, res) {
	res.sendfile(__dirname + '/dist/manager.js');
});

app.get('/vis-network.min.css', function (req, res) {
	res.sendfile(__dirname + '/node_modules/vis/dist/vis-network.min.css');
});

app.get('/vis-network.min.js', function (req, res) {
	res.sendfile(__dirname + '/node_modules/vis/dist/vis-network.min.js');
});

io.on('connection', function (socket) {
	dockerNetworkAnalyzer.getNetworkingData().then(
		function (containers) {
			socket.emit('update', containers);
		},
		function (err) {
			console.log(err);
		}
	);

	socket.on('get_container_info', function (containerId) {
		let container = docker.getContainer(containerId);

		container.inspect(function (err, data) {
			socket.emit('get_container_info', data);
		});

		container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
			stream.pipe(process.stdout);
		});
	});

	socket.on('stop_container', function (containerId) {
		let container = docker.getContainer(containerId);

		container.stop(function (err, data) {
			console.log(data);
		});
	});
});

setInterval(function () {
	dockerNetworkAnalyzer.getNetworkingData().then(
		function (containers) {
			io.emit('update', containers);
		},
		function (err) {
			console.log(err);
		}
	);
}, 1000);
