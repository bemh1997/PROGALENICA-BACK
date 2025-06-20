// usuarios/clientes/cliente.controller.js
const express = require('express');
const router = express.Router();
const UsuarioController = require('./usuario.controller');

// Obtener todos los usuarios PERMISOS DE ADMINISTRADOR
router.get('/', UsuarioController.getAllUsuarios);

// Crear un nuevo usuario
router.post('/', UsuarioController.createUsuario);

// Actualizar el rol de un usuario existente 
router.put('/', UsuarioController.updateUsuario);

// Eliminar un usuario
router.delete('/:id', UsuarioController.deleteUsuario);

module.exports = router;


/**
 * nombre
 * apellido paterno
 * telefono
 * correo
 * tipo de usuario
 */