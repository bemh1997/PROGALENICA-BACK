// productos/producto.routes.js
const express = require('express');
const router = express.Router();
const ProductoController = require('./producto.controller');

// Obtener todos los productos
router.get('/', ProductoController.getAllProductos);

// Obtener un producto por nombre
router.get('/search', ProductoController.getProductoByNombre);

// Obtener un producto por ID
router.get('/:id', ProductoController.getProductoById);

// Crear un nuevo producto
router.post('/', ProductoController.createProducto);

// Actualizar un producto existente
router.put('/:id', ProductoController.updateProducto);

// Eliminar un producto
router.delete('/:id', ProductoController.deleteProducto);

module.exports = router;