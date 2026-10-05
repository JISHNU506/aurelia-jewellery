import { readStorage, writeStorage } from '../hooks/useLocalStorage.js';

/** Orders are simulated entirely in the browser and kept in localStorage. */
export function saveOrder(order) {
  const orders = readStorage('orders', []);
  writeStorage('orders', [order, ...orders].slice(0, 20));
  return order;
}

export function getOrders() {
  return readStorage('orders', []);
}

export function getOrder(id) {
  return getOrders().find((o) => o.id === id);
}

export function newOrderId() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `AUR-${String(new Date().getFullYear()).slice(2)}${n}`;
}
