module.exports = class ContainerListFormatter {
	format(listContainers) {
		let containersFormatted = {};

		for (let container of listContainers) {
			let containerData = {};

			containerData.id = container.Id;
			containerData.name = container.Names[0];
			containerData.networks = [];

			for (let network in container.NetworkSettings.Networks) {
				containerData.networks.push(network);
			}

			containersFormatted[container.Id] = containerData;
		}

		return containersFormatted;
	}
}
