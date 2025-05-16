// paqueterias/paqueteria.routes.js
const express = require('express');
const router = express.Router();
const PaqueteriaController = require('./paqueteria.controller');

// Obtener todas las paqueterías
router.get('/', PaqueteriaController.getAllPaqueterias);

// Obtener una paquetería por ID
router.get('/:id', PaqueteriaController.getPaqueteriaById);

// Crear una nueva paquetería
router.post('/', PaqueteriaController.createPaqueteria);

// Actualizar una paquetería existente
router.put('/:id', PaqueteriaController.updatePaqueteria);

// Eliminar una paquetería
router.delete('/:id', PaqueteriaController.deletePaqueteria);

module.exports = router;