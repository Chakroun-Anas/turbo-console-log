<?php

class Database {
  private $connection;
  
  public function __construct($host, $dbname) {
    $dsn = "mysql:host=$host;dbname=$dbname";
    $this->connection = new PDO($dsn);
  }
}
