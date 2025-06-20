// productos/producto.routes.js
const express = require('express');
const router = express.Router();
const ProductoController = require('./producto.controller');

// Obtener todos los productos
router.get('/', ProductoController.getAllProductos);

// Buscar productos por nombre o código de barras
router.get('/search', ProductoController.searchProductos);

// Obtener un producto por ID
router.get('/:id', ProductoController.getProductoById);

// Crear un nuevo producto
router.post('/', ProductoController.createProducto);

// Actualizar un producto existente
router.put('/:id', ProductoController.updateProducto);

// Eliminar un producto
router.delete('/:id', ProductoController.deleteProducto);

module.exports = router;