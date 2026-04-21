<?php

function getUserData($id) {
  return ['id' => $id, 'name' => 'Test User'];
}

$userData = getUserData(123);
