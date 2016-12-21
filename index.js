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

io.on('connection', function (socket) {
	console.log('Member connected');

	dockerNetworkAnalyzer.getNetworkingData().then(
		function (containers) {
			socket.emit('update', containers);
		},
		function (err) {
			console.log(err);
		}
	);
});

setInterval(function() {
	dockerNetworkAnalyzer.getNetworkingData().then(
		function (containers) {
			console.log('Send update');
			io.emit('update', containers);
		},
		function (err) {
			console.log(err);
		}
	);
}, 1000);
