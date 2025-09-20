
const express = require('express');
const router = express.Router();
const DetalleController = require('./detalle.controller');

// Crear un nueva dirección (acceso para todos los usuarios)
router.post('/', DetalleController.createDetalle);

// Actualizar una dirección existente (acceso para admin o dueño de la dirección)
router.put('/:id', DetalleController.updateDetalle);

//Acceso solo para administradores
// Buscar direcciones por id de usuario
router.get('/search', DetalleController.getDetallesByPedido);

// Obtener todas las direcciones PERMISOS DE ADMINISTRADOR
router.get('/', DetalleController.getAllDetalles);

// Buscar direcciones por id de usuario
router.get('/:id', DetalleController.getDetalleById);

// Eliminar una dirección
router.delete('/:id', DetalleController.deleteDetalle);

module.exports = router;
