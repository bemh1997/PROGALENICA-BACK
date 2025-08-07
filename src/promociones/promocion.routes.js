// promociones/promocion.routes.js
const express = require('express');
const router = express.Router();
const PromocionController = require('./promocion.controller');

// Obtener todas las promociones
router.get('/', PromocionController.getAllPromociones);

// Obtener las promociones de determinado producto
router.get('/search', PromocionController.getPromocionByProducto);

// Obtener una promoción por ID
router.get('/:id', PromocionController.getPromocionById);

// Crear una nueva promoción
router.post('/', PromocionController.createPromocion);

// Actualizar una promoción existente
router.put('/:id', PromocionController.updatePromocion);

// Eliminar una promoción
router.delete('/:id', PromocionController.deletePromocion);

module.exports = router;