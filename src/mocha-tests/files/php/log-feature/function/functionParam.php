<?php

function calculateTotal($price, $tax) {
  $total = $price + ($price * $tax);
  return $total;
}
