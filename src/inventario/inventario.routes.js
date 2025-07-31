// productos/producto.routes.js
const express = require('express');
const router = express.Router();
const InventarioController = require('./inventario.controller');

// Obtener todas las entradas en inventario
router.get('/', InventarioController.getAllInventarios);

// Obtener las entradas de inventario de determinado producto
router.get('/search', InventarioController.getInventarioByProducto);

// Obtener una entrada de inventario por ID
router.get('/:id', InventarioController.getInventarioById);

// Crear una nueva entrada de inventario
router.post('/', InventarioController.createInventario);

// Actualizar una entrada de inventario existente
router.put('/:id', InventarioController.updateInventario);

// Eliminar una entrada de inventario
router.delete('/:id', InventarioController.deleteInventario);

module.exports = router;