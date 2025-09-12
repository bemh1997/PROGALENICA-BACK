
const express = require('express');
const router = express.Router();
const DireccionController = require('./direccion.controller');

// Obtener todos los laboratorios PERMISOS DE ADMINISTRADOR
router.get('/', DireccionController.getAllDirecciones);

// Buscar direcciones por id de usuario
router.get('/search', DireccionController.getDireccionesByCliente);

// Buscar direcciones por id de usuario
router.get('/:id', DireccionController.getDireccionById);

// Crear un nueva dirección
router.post('/', DireccionController.createDireccion);

// Actualizar una dirección existente
router.put('/:id', DireccionController.updateDireccion);

// Eliminar una dirección
router.delete('/:id', DireccionController.deleteDireccion);

module.exports = router;
