<?php
// connect to database
$pg = pg_connect("host=ec2-54-225-127-246.compute-1.amazonaws.com port=5432 dbname=dfsii38vmsgjoh user=eodwkfbdehxbwb password=NqrOz6GJrdc60WPYYkX9oGjMIK sslmode=require options='--client_encoding=UTF8'") or die('Could not connect: ' . pg_last_error());

// password
$password = 'mcgee';

// delete table
if ($_GET['password'] === $password) {
  if ($_GET['delete'] === 'true') {
    pg_query($pg, "DROP TABLE IF EXISTS audits") or die('error: ' . pg_last_error());
  }
}

// create table if it doesn't exist
pg_query($pg, "CREATE TABLE IF NOT EXISTS audits (audit text NOT NULL PRIMARY KEY);") or die('error: ' . pg_last_error());





// display data
if ($_GET['password'] === $password) {
  $audits = pg_query($pg, "SELECT * FROM audits;");
  while ($row = pg_fetch_row($audits)) {
    print("$row[0]\n\n\n\n\n\n\n");
  }
}

// insert audit into table
else {
  $audit = json_decode(file_get_contents('php://input'), true);
  $audit = $audit['audit'];

  if (strpos($audit, 'Report Results') === 0) {
    pg_query_params($pg, "INSERT INTO audits VALUES ($1);", array($audit)) or die('error: ' . pg_last_error());
    echo 'ok';
  }
  else {
    echo 'bad';
  }
}
