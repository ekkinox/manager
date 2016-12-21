module.exports = class DockerNetworkAnalyzer {
	constructor(dockerClient, containerListFormatter) {
		this.dockerClient = dockerClient;
		this.containerListFormatter = containerListFormatter;
	}

	getNetworkingData() {
		let that = this;

		return new Promise(
			function (resolve, reject) {
				that.dockerClient.listContainers(function (err, containers) {
					if (err) {
						return reject(err);
					} else {
						return resolve(that.containerListFormatter.format(containers));
					}
				});
			}
		);
	}
}
