<?php

function getUserById($id) {
  return ['id' => $id, 'name' => 'Test User', 'email' => 'test@example.com', 'active' => true];
}

function processUser($data) {
  return $data;
}

function processUserData($userData) {
  $userId = $userData['id'];
  // error_log("🚀 ~ userData: " . print_r($userData, true));
  
  if (!empty($userId)) {
    $user = getUserById($userId);
    // var_dump("🚀 ~ processUserData ~ user:", $user);
    
    if (empty($user['email'])) {
      // error_log("🚀 ~ processUserData ~ missing email: " . print_r($user, true));
    }
    
    if ($user['active']) {
      // error_log("🚀 ~ processUserData ~ processing user: " . print_r($user, true));
    }
    
    $result = [
      'user' => $user,
      'processed' => true
    ];
    
    // error_log("🚀 ~ processUserData ~ result: " . print_r($result, true));
    // print_r(["🚀 ~ processUserData ~ table data:" => $result]);
    
    return $result;
  }
  
  $processedUser = processUser($userData);
  // error_log("🚀 ~ processedUser: " . print_r($processedUser, true));
  
  // error_log("🚀 ~ multiline log: " . print_r($processedUser, true));
  
  return $processedUser;
}
