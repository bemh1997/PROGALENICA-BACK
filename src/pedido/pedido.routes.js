
const express = require('express');
const router = express.Router();
const Pedido = require('./pedido.controller');

// Obtener todos los laboratorios PERMISOS DE ADMINISTRADOR
router.get('/', Pedido.getAllPedidos);

// Buscar Pedidos por id de usuario
router.get('/search', Pedido.getPedidosByUser);

// Buscar Pedidos por id de usuario
router.get('/:id', Pedido.getPedidoById);

// Generar un nuevo pedido
router.post('/', Pedido.createPedido);

// Actualizar un pedido existente
router.put('/:id', Pedido.updatePedido);

// Eliminar un pedido
router.delete('/:id', Pedido.deletePedido);

module.exports = router;
