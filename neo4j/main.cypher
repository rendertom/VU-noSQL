// Remove all relationships
MATCH (a) -[r] -> () DELETE a, r

// Delete all entities
MATCH (a) DELETE a

// Delete inMemoty table
CALL gds.graph.drop("myGraph", false)

/////////////////////////////////////////////////////////

MERGE (a:City {name: 'A'})
MERGE (b:City {name: 'B'})
MERGE (c:City {name: 'C'})
MERGE (d:City {name: 'D'})
MERGE (e:City {name: 'E'})
MERGE (f:City {name: 'F'})
MERGE (a) -[:ROAD {cost: 10}]-> (b)
MERGE (a) -[:ROAD {cost: 7}]-> (c)
MERGE (a) -[:ROAD {cost: 10}]-> (d)
MERGE (a) -[:ROAD {cost: 150}]-> (d)
MERGE (a) -[:ROAD {cost: 200}]-> (e)
MERGE (b) -[:ROAD {cost: 15}]-> (c)
MERGE (c) -[:ROAD {cost: 5}]-> (a)
MERGE (c) -[:ROAD {cost: 150}]-> (a)
MERGE (d) -[:ROAD {cost: 8}]-> (a)
MERGE (d) -[:ROAD {cost: 10}]-> (e)
MERGE (e) -[:ROAD {cost: 150}]-> (a)
MERGE (e) -[:ROAD {cost: 1500}]-> (a)
MERGE (e) -[:ROAD {cost: 10}]-> (f)
MERGE (f) -[:ROAD {cost: 15}]-> (e)
MERGE (busA:Bus {name: 'Bus-A'})
MERGE (busB:Bus {name: 'Bus-B'})
MERGE (busC:Bus {name: 'Bus-C'})
MERGE (busD:Bus {name: 'Bus-D'})
MERGE (busA) -[:STOPS_AT]-> (a)
MERGE (busA) -[:STOPS_AT]-> (b)
MERGE (busA) -[:STOPS_AT]-> (c)
MERGE (busB) -[:STOPS_AT]-> (a)
MERGE (busB) -[:STOPS_AT]-> (c)
MERGE (busB) -[:STOPS_AT]-> (d)
MERGE (busC) -[:STOPS_AT]-> (a)
MERGE (busC) -[:STOPS_AT]-> (d)
MERGE (busC) -[:STOPS_AT]-> (e)
MERGE (busD) -[:STOPS_AT]-> (a)
MERGE (busD) -[:STOPS_AT]-> (e)
MERGE (busD) -[:STOPS_AT]-> (f)

// Create inMemory table
CALL gds.graph.project(
    'myGraph',
    'City',
    'ROAD',
    { relationshipProperties: 'cost' }
)

/////////////////////////////////////////////////////////

// 0. Show database content
MATCH (n) RETURN n

// 1. Find busses by name
MATCH (bus:Bus {name:'Bus-A'})
RETURN bus

// 2. Find busses by partial name
MATCH (bus:Bus) WHERE bus.name CONTAINS 'Bus-'
RETURN bus

// 3. Find bus stops for a bus 'Bus-B'
MATCH cities = (bus:Bus {name: 'Bus-B'}) -[:STOPS_AT]- (city)
RETURN cities, city.name as cityName

// 4. Find busses to get from city 'A' to city 'F'
MATCH (start:City {name:'C'}), (finish:City {name:'F'})
MATCH paths = allShortestPaths((start) -[:STOPS_AT*]- (finish))
RETURN paths,
  [node IN nodes(paths) | CASE
    WHEN node:City THEN 'City ' + node.name
    WHEN node:Bus THEN 'Bus ' + node.name
    ELSE '' END] AS nodeNames

// 5. Find stops from city to city with max number of hops
MATCH cities = (start:City {name:'A'}) -[road:ROAD *..3]-> (finish:City {name:'F'})
RETURN cities,
  size(relationships(cities)) AS numHops,
  [node IN nodes(cities) | node.name] AS cityNames,
  [r IN relationships(cities) | r.cost] AS costs,
  apoc.coll.sum([r IN relationships(cities) | r.cost]) AS totalCost
ORDER BY numHops, totalCost

// 6. Find cheapest path from city to city
MATCH (start:City {name: 'B'}), (finish:City {name: 'F'})
CALL gds.shortestPath.dijkstra.stream('myGraph', {
  sourceNode: start,
  targetNode: finish,
  relationshipWeightProperty: 'cost' // REMOVE THIS FOR UNWEIGHTED GRAPH
})
YIELD index, totalCost, costs, nodeIds, path
RETURN
  totalCost,
  costs,
  [nodeId IN nodeIds | gds.util.asNode(nodeId).name] AS nodeNames,
  size(nodeIds) as nodeCount,
  nodes(path) as path

// 7. Find shortest path from city to city







## 2.4. Surasti trumpiausia kelią MIN/MAX kaina
# shortest path -> 230
# largest path  -> 375

MATCH
(start:City{name:'B'}),
(end:City{name:'F'}),
paths = allShortestPaths((start) -[:ROAD*]-> (end))
RETURN paths, REDUCE(sum = 0, road IN RELATIONSHIPS(paths) | sum + road.cost) AS cost, [node IN nodes(paths) | node.name] AS cityNames
ORDER BY cost ASC

OR

MATCH (start:City{name:'B'}), (end:City{name:'F'}),
  paths = allShortestPaths((start) -[:ROAD*]-> (end))
RETURN paths,
  apoc.coll.sum([rel in relationships(paths) | rel.cost]) as cost,
  [node IN nodes(paths) | node.name] AS cityNames
ORDER BY cost ASC

-------







match (n:Bus)
where 
return n