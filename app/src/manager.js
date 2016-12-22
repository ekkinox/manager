class Drawer {
	constructor(graph, nodes, edges) {
		this.graph = graph;
		this.nodes = nodes;
		this.edges = edges;
	}

	draw() {
		let that = this;

		this.edges.forEach(function (edge) {
			if (!that.graph.hasLinkById(edge.id)) {
				that.edges.remove(edge.id);
			}
		});

		this.nodes.forEach(function (node) {
			if (!that.graph.hasContainerById(node.id)) {
				that.nodes.remove(node.id);
			}
		});

		for (let containerId in this.graph.containers) {
			let container = this.graph.containers[containerId];

			if (!container.isDrawn() && container.shouldBeDisplayed) {
				this.nodes.add({id: container.id, label: container.name, shape: 'box', color: {border: 'black', background: 'white'}, font: {size: 20}});

				container.setDraw(true);
			}

			if (container.isDrawn() && !container.shouldBeDisplayed) {
				this.nodes.remove(container.id);
			}
		}

		for (let linkId in this.graph.links) {
			let link = this.graph.links[linkId];

			if (!link.isDrawn() && link.shouldBeDisplayed) {
				this.edges.add({id: link.id, from: link.fromContainer.id, to: link.toContainer.id, label: link.network.name, width: 2, color: link.network.color});

				link.setDraw(true);
			}

			if (link.isDrawn() && !link.shouldBeDisplayed) {
				this.edges.remove(link.id);
			}
		}
	}
}

class Graph {
	constructor() {
		this.containers = {};
		this.networks = {};
		this.links = {};
	}

	updateDisplayedNetworksAndContainers(networksNames, containersIds) {
		for (let networkName in this.networks) {
			this.getNetworkByName(networkName).setShouldBeDisplayed(false);
		}

		for (let networkName of networksNames) {
			if (this.hasNetworkByName(networkName)) {
				this.getNetworkByName(networkName).setShouldBeDisplayed(true);
			}
		}

		for (let containerId in this.containers) {
			this.getContainerById(containerId).setShouldBeDisplayed(false);
		}

		for (let containerId of containersIds) {
			if (this.hasContainerById(containerId)) {
				this.getContainerById(containerId).setShouldBeDisplayed(true);
			}
		}

		for (let linkId in this.links) {
			let link = this.getLinkById(linkId);

			link.setShouldBeDisplayed(link.fromContainer.shouldBeDisplayed && link.toContainer.shouldBeDisplayed && link.network.shouldBeDisplayed);
		}
	}

	addContainer(container) {
		if (!this.hasContainerById(container.id)) {
			this.containers[container.id] = container;
		}
	}

	hasContainerById(containerId) {
		return this.containers.hasOwnProperty(containerId);
	}

	getContainerById(containerId) {
		if (this.hasContainerById(containerId)) {
			return this.containers[containerId];
		}

		return null;
	}

	removeContainerById(containerId) {
		if (this.hasContainerById(containerId)) {
			delete this.containers[containerId];
		}
	}

	addNetwork(network) {
		if (!this.hasNetworkByName(network.name)) {
			this.networks[network.name] = network;
		}
	}

	hasNetworkByName(networkName) {
		return this.networks.hasOwnProperty(networkName);
	}

	removeNetworkByName(networkName) {
		if (this.hasNetworkByName(networkName)) {
			delete this.networks[networkName];
		}
	}

	getNetworkByName(networkName) {
		if (this.hasNetworkByName(networkName)) {
			return this.networks[networkName];
		}

		return null;
	}

	hasLinkById(linkId) {
		return this.links.hasOwnProperty(linkId);
	}

	getLinkById(linkId) {
		if (this.hasLinkById(linkId)) {
			return this.links[linkId];
		}

		return null;
	}

	addLink(link) {
		if (!this.hasLinkById(link.id)) {
			this.links[link.id] = link;
		}
	}

	getLinksByContainer(containerId) {
		let containerLinks = [];

		for (let linkId in this.links) {
			let link = this.links[linkId];

			if (link.fromContainer.id == containerId || link.toContainer.id == containerId) {
				containerLinks[linkId] = link;
			}
		}

		return containerLinks;
	}

	dumpContainers() {
		console.log(this.containers);
	}

	dumpLinks() {
		console.log(this.links);
	}

	getContainersByNetworkName(networkName) {
		let containers = [];

		for (let containerId in this.containers) {
			let container = this.containers[containerId];

			for (let containerNetworkName in container.networks) {
				if (networkName == containerNetworkName) {
					containers.push(container);
				}
			}
		}

		return containers;
	}

	updateRemoteContainers(remoteContainers) {
		let containersPreUpdate = this.containers;
		let networksPreUpdate = this.networks;

		this.containers = {};
		this.networks = {};

		for (let key in remoteContainers) {
			let remoteContainer = remoteContainers[key];

			let container = new Container(remoteContainer.name, remoteContainer.id, {});

			if (containersPreUpdate.hasOwnProperty(container.id)) {
				container.setDraw(containersPreUpdate[container.id].isDrawn());
			}

			for (let remoteNetwork of remoteContainer.networks) {
				if (!this.hasNetworkByName(remoteNetwork)) {
					let network = new Network(remoteNetwork);

					if (networksPreUpdate.hasOwnProperty(remoteNetwork)) {
						network.setDraw(networksPreUpdate[remoteNetwork].isDrawn());
						network.setColor(networksPreUpdate[remoteNetwork].color);
					}
					this.addNetwork(network);
				}

				let network = this.getNetworkByName(remoteNetwork);

				container.addNetwork(network);

				let sibblingsContainers = this.getContainersByNetworkName(network.name);

				for (let sibblingContainer of sibblingsContainers) {
					if (sibblingContainer.id != container.id) {
						let link = new Link(network, container, sibblingContainer);

						this.addLink(link);
					}
				}
			}

			this.addContainer(container);
		}
	}

	getContainersNames() {
		let containersNames = [];

		for (let containerName in this.containers) {
			containersNames.push(containerName);
		}

		return containersNames;
	}

	getNetworksNames() {
		let networksNames = [];

		for (let networkName in this.networks) {
			networksNames.push(networkName);
		}

		return networksNames;
	}
}

class Container {
	constructor(name, id, networks) {
		this.name = name;
		this.id = id;
		this.networks = networks;
		this.drawn = false;
		this.shouldBeDisplayed = true;
	}

	setShouldBeDisplayed(shouldBeDisplayed) {
		this.shouldBeDisplayed = shouldBeDisplayed;
	}

	addNetwork(network) {
		if (!this.hasNetworkByName(network.name)) {
			this.networks[network.name] = network;
		}
	}

	hasNetworkByName(networkName) {
		return this.networks.hasOwnProperty(networkName);
	}

	removeNetworkByName(networkName) {
		if (this.hasNetworkByName(networkName)) {
			delete this.networks[networkName];
		}
	}

	dumpNetworks() {
		console.log(this.networks);
	}

	isDrawn() {
		return this.drawn;
	}

	setDraw(drawn) {
		this.drawn = drawn;
	}
}

class Network {
	constructor(name) {
		this.name = name;
		this.drawn = false;
		this.color = this.buildColor();
		this.shouldBeDisplayed = true;
	}

	isDrawn() {
		return this.drawn;
	}

	setDraw(drawn) {
		this.drawn = drawn;
	}

	setColor(color) {
		this.color = color;
	}

	buildColor() {
		let random = new Random();

		return '#'+((random.real(0, 1))*0xFFFFFF<<0).toString(16);
	}

	setShouldBeDisplayed(shouldBeDisplayed) {
		this.shouldBeDisplayed = shouldBeDisplayed;
	}
}

class Link {
	constructor(network, fromContainer, toContainer) {
		this.network = network;
		this.fromContainer = fromContainer;
		this.toContainer = toContainer;
		this.id = this.buildId();
		this.drawn = false;
		this.shouldBeDisplayed = true;
	}

	setShouldBeDisplayed(shouldBeDisplayed) {
		this.shouldBeDisplayed = shouldBeDisplayed;
	}

	isDrawn() {
		return this.drawn;
	}

	setDraw(drawn) {
		this.drawn = drawn;
	}

	buildId() {
		let containersId = [this.fromContainer.id, this.toContainer.id].sort().join('_');

		return [this.network.name, containersId].join('_');
	}
}
