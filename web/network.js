let shadowState, nodes, edges, network;

function startNetwork() {
    shadowState = false;

    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);

    let container = document.getElementById('network');
    let data = {
        nodes: nodes,
        edges: edges
    };
    let options = {
        autoResize: true,
        height: (window.innerHeight - 75) + "px",
        physics : {
            solver: 'repulsion',
            repulsion: {
                centralGravity: 0.01,
                springLength: 200,
                springConstant: 0.05,
                nodeDistance: 500,
                damping: 0.09
            },
        }
    };

    network = new vis.Network(container, data, options);

    network.on('click', function (params) {
        if (params.nodes.length > 0) {
            $('#modal').modal();
            socket.emit('get_container_info', params.nodes[0]);
        }
    });

    network.on('doubleClick', function (params) {
        if (params.nodes.length > 0) {
            socket.emit('stop_container', params.nodes[0]);
        }
    });

    setTimeout(function() {
        network.clusterOutliers();
    }, 5000);
}

startNetwork();

let graph = new Graph(nodes, edges);

let socket = io('http://127.0.0.1:3000');

socket.on('update', function (remoteContainers) {
    graph.setRemoteContainers(remoteContainers);

    graph.draw();
});

socket.on('get_container_info', function (data) {
    $('#modalTitle').html(data.Name);
    $('#modalTabInfo').html('<dl class="dl-horizontal"><dt>Id</dt><dd>'  + data.Id + '</dd></dl>');
});
