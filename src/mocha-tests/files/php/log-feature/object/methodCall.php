<?php

class Product {
  public function getName() {
    return 'Product Name';
  }
  
  public function getPrice() {
    return 99.99;
  }
}

$product = new Product();
$productName = $product->getName();
$productPrice = $product->getPrice();
