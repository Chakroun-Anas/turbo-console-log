<?php

class UserManager {
  public function createUser($name, $email) {
    $user = [
      'name' => $name,
      'email' => $email,
      'created' => time()
    ];
    
    return $user;
  }
  
  public function validateUser($user) {
    $isValid = !empty($user['name']) && !empty($user['email']);
    return $isValid;
  }
}
