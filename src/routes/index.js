const express = require('express');
const router = express.Router();

// // Rutas por módulo
const usuarioRoutes = require('../usuarios/usuario.routes');
const clienteRoutes = require('../usuarios/clientes/cliente.routes');
// const medicoRoutes = require('../medicos/medico.routes');
// const representanteRoutes = require('../representantes/representante.routes');
const productoRoutes = require('../productos/producto.routes');
const inventarioRoutes = require('../inventario/inventario.routes');
const promocionRoutes = require('../promociones/promocion.routes');
const pedidoRoutes = require('../pedido/pedido.routes');
// const detalleRoutes = require('../pedidos/detalles/detalle.routes');
const paqueteriaRoutes = require('../paqueterias/paqueteria.routes');
const laboratorioRoutes = require('../laboratorio/laboratorio.routes');
const direccionRoutes = require('../direccion/direccion.routes');
// const administradorRoutes = require('../administradores/administrador.routes');

// Uso de rutas
router.use('/usuarios', usuarioRoutes);
router.use('/usuarios/clientes', clienteRoutes);
// router.use('/medicos', medicoRoutes);
// router.use('/representantes', representanteRoutes);
router.use('/productos', productoRoutes);
router.use('/inventario', inventarioRoutes);
router.use('/promociones', promocionRoutes);
router.use('/pedido', pedidoRoutes);
// router.use('/detalles', detalleRoutes);
router.use('/paqueterias', paqueteriaRoutes);
router.use('/laboratorios', laboratorioRoutes);
router.use('/direcciones', direccionRoutes);
// router.use('/administradores', administradorRoutes);

module.exports = router;
