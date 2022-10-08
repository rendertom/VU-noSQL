DROP KEYSPACE IF EXISTS laboras;
CREATE KEYSPACE laboras
WITH replication = {'class':'SimpleStrategy', 'replication_factor' : 1};

USE laboras;

