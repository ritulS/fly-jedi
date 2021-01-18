/* file for calculating the minimum distance between planets and moons using djikstra algorithm
1. Ajan Kloss - AJK
2. Alderaan - ADR
3. Dagobah - DAG
4. Hosnian Prime - HSP
5. Arvala-7 - AV7
6. Coruscant - CST
7. Garel - GRL
time is set in minutes
*/

const destinations = ["AJK", "ADR", "DAG", "HSP", "AV7", "CST", "GRL"];
const routeMappings = [
  [0, 150, 0, 0, 0, 0, 0],
  [150, 0, 90, 300, 0, 240, 0],
  [0, 90, 0, 0, 0, 0, 0],
  [0, 300, 0, 0, 0, 120, 0],
  [0, 0, 0, 0, 0, 60, 0],
  [0, 240, 0, 120, 60, 0, 60],
  [0, 0, 0, 0, 0, 60, 0],
];
const totalDest = 7; // total destinations on the graph
var destination = 0; // the destination to go to
var nextTraversal = []; // the array that stores the nodes to traverse to
var visitedNodes = []; //  the array the holds the details of visited Nodes

// function that creates the shortest route using the visitedNodes array
function createShortestRoute(origin) {
  route = [destination];
  i = destination;
  while (i != origin) {
    route = route.concat([visitedNodes[i].via]);
    i = visitedNodes[i].via;
  }

  route.reverse();
  return route;
}

// function to check if the new via duration is less than the total duration to destination
function checkOtherNodes(destNode) {
  nodesToPop = [];
  for (let node of nextTraversal) {
    // popping out the node whose duration from start is more than duration from start to destination
    if (
      visitedNodes[node].durationFromStart != Infinity &&
      visitedNodes[node].durationFromStart >
        visitedNodes[destNode].durationFromStart
    ) {
      nodesToPop.push(node);
    }
  }

  nextTraversal = nextTraversal.filter((value) => {
    if (nodesToPop.indexOf(value) == -1) {
      return true;
    } else {
      return false;
    }
  });
}

// function to traverse the routeMappings array
function traversal() {
  if (nextTraversal.length == 0) {
    return;
  }

  dist = {}; // dictionary to hold the respective distances of nodes to traverse to from current node
  nodes = []; // the next nodes to traverse to from current node
  currentNode = nextTraversal.shift(); // current node is the first node of nextTraversal

  // only traverse if the current node is not the destination
  if (currentNode != destination) {
    for (let i = 0; i < totalDest; i++) {
      if (routeMappings[currentNode][i] != 0) {
        /* 
            the duration for the next node in traversal will be current node duration from start +
            the duration from the current node to the next node in traversal
            */
        var dis = {};
        dis[i] =
          visitedNodes[currentNode].durationFromStart +
          routeMappings[currentNode][i];
        dist = {
          ...dist,
          ...dis,
        };
        nodes.push(i);
      }
    }
    updateVisitedNodes(currentNode, nodes, dist);
    traversal();
  } else {
    /* 
    when currentNode is destination check if other nodes to traverse have 
    shorter durations than currentNode
    */
    checkOtherNodes(currentNode);
    traversal();
  }
}

// function to update the nextTraversal and visitedNodes array
function updateVisitedNodes(via, nodes, durationFromStart) {
  for (let node of nodes) {
    if (visitedNodes[node].durationFromStart == Infinity) {
      visitedNodes[node].durationFromStart = durationFromStart[node];
      visitedNodes[node].via = via;
      nextTraversal.push(node);
    } else if (visitedNodes[node].durationFromStart > durationFromStart[node]) {
      visitedNodes[node].durationFromStart = durationFromStart[node];
      visitedNodes[node].via = via;
      nextTraversal.push(node);
    } else {
      continue; // a better route exists, no need to traverse from this combination
    }
  }
}

function djikstraGetShortestRoute(start, end) {
  const indexS = destinations.indexOf(start);
  const indexE = destinations.indexOf(end);
  // if there is an error with the start and end input sent to the function
  if (indexE == -1 || indexS == -1) {
    throw new Error("error: start or end destinations entered do not exist");
  }

  // for initializing the visited node array for successive runs
  var vN = [];
  for (let i = 0; i < totalDest; i++) {
    vN.push({
      durationFromStart: Infinity,
      via: null,
    });
  }
  visitedNodes = vN;

  nextTraversal = [indexS]; // setting up the starting node
  destination = indexE; // setting up the ending node
  visitedNodes[indexS].durationFromStart = 0;
  traversal();
  const route_ = createShortestRoute(indexS);
  var route = [];

  for (let i of route_) {
    route.push(destinations[i]);
  }

  return route;
}

module.exports = djikstraGetShortestRoute;
