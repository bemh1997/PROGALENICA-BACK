// usuarios/clientes/cliente.controller.js
const express = require('express');
const router = express.Router();
const ClienteController = require('./cliente.controller');

// Obtener todos los clientes PERMISOS DE ADMINISTRADOR
router.get('/', ClienteController.getAllClientes);

// Buscar clientes por nombre o correo electrónico PERRMISOS DE ADMINISTRADOR
router.get('/search', ClienteController.searchClientes);

// Acceso a cliente por email y password
router.post('/login', ClienteController.loginCliente);

// Crear un nuevo cliente
router.post('/', ClienteController.createCliente);

// Actualizar un cliente existente
router.put('/', ClienteController.updateCliente);

// Eliminar un cliente
router.delete('/:id', ClienteController.deleteCliente);

module.exports = router;
