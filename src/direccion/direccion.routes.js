
const express = require('express');
const router = express.Router();
const DireccionController = require('./direccion.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin} = require('../utils/auth.middleware');

// Crear un nueva dirección (acceso para todos los usuarios)
router.post('/', DireccionController.createDireccion);

// Actualizar una dirección existente (acceso para admin o dueño de la dirección)
router.put('/:id', /*verifyToken, isOwnerOrAdmin,*/ DireccionController.updateDireccion);

//Acceso solo para administradores
// Buscar direcciones por id de usuario
router.get('/search', DireccionController.getDireccionesByCliente);

// Obtener todas las direcciones PERMISOS DE ADMINISTRADOR
router.get('/', /*verifyToken, isAdmin,*/ DireccionController.getAllDirecciones);

// Buscar direcciones por id de usuario
router.get('/:id', /*verifyToken, isAdmin,*/ DireccionController.getDireccionById);

// Eliminar una dirección
router.delete('/:id', /*verifyToken, isAdmin,*/ DireccionController.deleteDireccion);

module.exports = router;
