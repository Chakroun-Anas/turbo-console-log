<?php

function processUser($userId) {
  $userName = 'John Doe';
  $userEmail = 'john@example.com';
  
  return [
    'id' => $userId,
    'name' => $userName,
    'email' => $userEmail
  ];
}
