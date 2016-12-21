class Graph {
	constructor(nodes, edges, links = {}) {
		this.containers = {};
		this.networks = {};
		this.nodes = nodes;
		this.edges = edges;
		this.links = links;
	}

	addContainer(container) {
		if (!this.hasContainerById(container.id)) {
			this.containers[container.id] = container;
		}
	}

	hasContainerById(containerId) {
		return this.containers.hasOwnProperty(containerId);
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

	setRemoteContainers(remoteContainers) {
		let containersPreUpdate = this.containers;

		this.containers = {};

		for (let key in remoteContainers) {
			let remoteContainer = remoteContainers[key];

			let container = new Container(remoteContainer.name, remoteContainer.id, {});

			if (containersPreUpdate.hasOwnProperty(container.id)) {
				container.setDraw(true);
			}

			for (let remoteNetwork of remoteContainer.networks) {
				if (!this.hasNetworkByName(remoteNetwork)) {
					this.addNetwork(new Network(remoteNetwork));
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

		for (let containerPreUpdateId in containersPreUpdate) {
			if (!this.hasContainerById(containerPreUpdateId)) {
				let containerLinks = this.getLinksByContainer(containerPreUpdateId);

				for (let linkId in containerLinks) {
					this.edges.remove(linkId);
				}

				this.nodes.remove(containerPreUpdateId);
			}
		}
	}

	draw() {
		for (let containerId in this.containers) {
			let container = this.containers[containerId];

			if (!container.isDrawn()) {
				this.nodes.add({id: container.id, label: container.name, shape: 'box', color: {border: 'black', background: 'white'}, font: {size: 20}});

				container.setDraw(true);
			}
		}

		for (let linkId in this.links) {
			let link = this.links[linkId];

			if (!link.isDrawn()) {
				this.edges.add({id: link.id, from: link.fromContainer.id, to: link.toContainer.id, label: link.network.name, width: 2, color: link.network.color});

				link.setDraw(true);
			}
		}
	}
}

class Container {
	constructor(name, id, networks) {
		this.name = name;
		this.id = id;
		this.networks = networks;
		this.drawn = false;
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
	}

	isDrawn() {
		return this.drawn;
	}

	setDraw(drawn) {
		this.drawn = drawn;
	}

	buildColor() {
		return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}
}

class Link {
	constructor(network, fromContainer, toContainer) {
		this.network = network;
		this.fromContainer = fromContainer;
		this.toContainer = toContainer;
		this.id = this.buildId();
		this.drawn = false;
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
