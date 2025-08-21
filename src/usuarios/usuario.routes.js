const express = require('express');
const router = express.Router();
const UsuarioController = require('./usuario.controller');
const { verifyToken, isAdmin } = require('../utils/auth.middleware');

// Rutas públicas
router.post('/login', UsuarioController.loginUsuario);
router.post('/', UsuarioController.createUsuario);

// Rutas protegidas que requieren autenticación y permisos de administrador
router.get('/', verifyToken, isAdmin, UsuarioController.getAllUsuarios);

// Rutas protegidas que requieren autenticación y permisos de administrador
router.put('/', verifyToken, isAdmin, UsuarioController.updateUsuario);
router.delete('/:id', verifyToken, isAdmin, UsuarioController.deleteUsuario);

module.exports = router;


/**
 * nombre
 * apellido paterno
 * telefono
 * correo
 * tipo de usuario
 */