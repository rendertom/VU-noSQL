const neo4j = require('neo4j-driver');
const clc = require('cli-color');
const notice = (obj) => console.log(clc.blue('\n' + obj));

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'testukas')
);
const session = driver.session();

main();

async function main() {
  try {
    // await clearDatabase();
    // await createData();
    // await createInMemoryTable();

    notice(`1. Find busses by name 'Bus-A':`);
    console.log(await findBussesByFullName('Bus-A'));

    notice(`2. Find busses by partial name 'Bus-':`);
    console.log(await findBussesByPartialName('Bus-'));

    notice(`3. Find bus stops for bus 'Bus-B':`);
    console.log(await findBusStopsForBus('Bus-B'));

    notice(`4. Find busses to get from city 'C' to city 'F'`);
    console.log(await findBussesToGetFromCityToCity('C', 'F'));

    notice(`5. Find stops from city 'A' to 'F' with max number of 3 hops:`);
    console.log(await findStopsFromCityToCity('A', 'F', 3));

    notice(`6. Find cheapest path from city 'B' to city 'F'`);
    console.log(await findCheapestPathFromCityToCity('B', 'F'));

    notice(`7. Find shortest paths from city 'B' to city 'F'`);
    console.log(await findShortestPathFromCityToCity('B', 'F'));
  } catch (error) {
    console.error(error);
  } finally {
    await session.close();
    await driver.close();
  }
}

async function clearDatabase() {
  await session.run('match (a) -[r] -> () delete a, r');
  await session.run('match (a) delete a');
  await session.run('CALL gds.graph.drop("myGraph", false)');
}

async function createData() {
  await session.run(`
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
  `);
}

async function createInMemoryTable() {
  await session.run(`
    CALL gds.graph.project(
      'myGraph',
      'City',
      'ROAD',
      { relationshipProperties: 'cost' }
    )
  `);
}

async function findBussesByFullName(name) {
  return (
    await session.run(`MATCH (bus:Bus {name:'${name}'}) RETURN bus`)
  ).records.map((record) => record.get(0).properties.name);
}

async function findBussesByPartialName(name) {
  return (
    await session.run(
      `MATCH (bus:Bus) WHERE bus.name CONTAINS '${name}' RETURN bus`
    )
  ).records.map((record) => record.get(0).properties.name);
}

async function findBusStopsForBus(name) {
  return (
    await session.run(`
      MATCH cities = (bus:Bus {name: '${name}'}) -[:STOPS_AT]- (city)
      RETURN cities, city.name as cityName
    `)
  ).records
    .map((record) => record.get(0).end.properties.name)
    .sort();
}

async function findBussesToGetFromCityToCity(cityA, cityB) {
  return (
    await session.run(`
      MATCH (start:City {name:'${cityA}'}), (finish:City {name:'${cityB}'})
      MATCH paths = allShortestPaths((start) -[:STOPS_AT*]- (finish))
      RETURN paths,
        [node IN nodes(paths) | CASE
        WHEN node:City THEN 'City ' + node.name
        WHEN node:Bus THEN 'Bus ' + node.name
        ELSE '' END] AS nodeNames
    `)
  ).records.map((record) => record.get(1));
}

async function findStopsFromCityToCity(cityA, cityB, numHops = 3) {
  return (
    await session.run(`
      MATCH cities = (start:City {name:'${cityA}'}) -[:ROAD *..${numHops}]-> (finish:City {name:'${cityB}'})
      RETURN cities,
        size(relationships(cities)) AS numHops,
        [node IN nodes(cities) | node.name] AS cityNames,
        [r IN relationships(cities) | r.cost] AS costs,
        apoc.coll.sum([r IN relationships(cities) | r.cost]) AS totalCost
      ORDER BY numHops, totalCost
    `)
  ).records.map((record) => ({
    numHops: record.get(1).low,
    cities: record.get(2),
    costs: record.get(3).join(', '),
    totalCost: record.get(4),
  }));
}

async function findCheapestPathFromCityToCity(cityA, cityB) {
  var res = await session.run(`
    MATCH (start:City {name: '${cityA}'}), (finish:City {name: '${cityB}'})
    CALL gds.shortestPath.dijkstra.stream('myGraph', {
      sourceNode: start,
      targetNode: finish,
      relationshipWeightProperty: 'cost'
    })
    YIELD index, totalCost, costs, nodeIds, path
    RETURN
      totalCost,
      costs,
      [nodeId IN nodeIds | gds.util.asNode(nodeId).name] AS nodeNames,
      size(nodeIds) as nodeCount,
      nodes(path) as path
  `);

  const record = res.records[0];
  return {
    totalCost: record.get(0),
    costs: record.get(1),
    path: record.get(2),
    numCities: record.get(3).low,
  };
}

async function findShortestPathFromCityToCity(cityA, cityB) {
  return (
    await session.run(`
      MATCH (start:City{name:'${cityA}'}), (end:City{name:'${cityB}'}),
        paths = allShortestPaths((start) -[:ROAD*]-> (end))
      RETURN paths,
        apoc.coll.sum([rel in relationships(paths) | rel.cost]) as cost,
        [node IN nodes(paths) | node.name] AS cityNames
      ORDER BY cost ASC
    `)
  ).records.map((record) => ({
    kaina: record.get(1),
    kelias: record.get(2),
  }));
}
