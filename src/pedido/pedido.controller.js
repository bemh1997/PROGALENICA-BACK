require('dotenv').config();
const { Pedido, Usuario } = require('../config/database.js');
const fs = require('fs').promises;
const path = require('path');
class PedidoController {
  /**
   * Obtiene todos los pedidos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllPedidos(req, res) {
    try {
      let pedidos = await Pedido.findAll({
        order: [['id_pedido', 'ASC']],
        where: { activo: true }
      });

      res.status(200).json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pedidos',
        error: error.message
      });
    }
  }

  /**
   * Busca laboratorios por nombre
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */

  static async getPedidosByUser(req, res) {
    try {
      const { id } = req.query;
      const pedidos = await Pedido.findAll({
        order: [['id_pedido', 'DESC']],
        where: {
          id_usuario: id
        }
      });

      res.status(200).json({
        success: true,
        data: pedidos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar los pedidos',
        error: error.message
      });
    }
  }

  /**
   * Busca laboratorios por nombre
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */

  static async getPedidoById(req, res) {
    try {
      const { id } = req.query;
      const pedido = await Pedido.finOne({
        order: [['id_pedido', 'DESC']],
        where: {
          id_pedido: id
        }
      });

      res.status(200).json({
        success: true,
        data: pedido
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Pedido inexistente',
        error: error.message
      });
    }
  }

  /**
   * genera un nuevo pedido
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createPedido(req, res) {
    try {
      const {
        id_cliente, //dentro de la sesión, no en formulario
        id_direccion_envio, //dentro de la sesión, en formulario (sin validación)
        // id_paqueteria, //Ejecutivo
        estatus, //Ejecutivo
        forma_pago, //Formulario
        subtotal, //Se calcula de los pedidos
        // costo_envio, //Ejecutivo
        // total, // = subtotal + costo_envio
        // guia_entrega, //Ejecutivo
        // factura, //Ejecutivo
        // notas_administrativas, //Ejecutivo
        envio_contacto, //obtenido de id_cliente
        envio_direccion, //obtenido de id_direccion_envio
        envio_referencias,
        // envio_colonia,
        // envio_municipio,
        // envio_estado,
        // envio_codigo_postal,
      } = req.body;

      // Operaciones antes de generar el pedido
      const usuario = await Usuario.findByPk(id_cliente);
      envio_contacto = `${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno} ${usuario.telefono}`;

      const direccion = await Direccion.findByPk(id_direccion_envio);
      if (!direccion.numero_interior) 
        envio_direccion = `${direccion.calle} No. ${direccion.numero_exterior}, colonia ${direccion.colonia} C.P. ${direccion.codigo_postal}. ${direccion.municipio}, ${direccion.estado}`;
      else
        envio_direccion = `${direccion.calle} No. ${direccion.numero_exterior} Int. ${direccion.numero_interior}, colonia ${direccion.colonia} C.P. ${direccion.codigo_postal}. ${direccion.municipio}, ${direccion.estado}`;

      envio_referencias = direccion.referencias;

      const pedido = await Pedido.create({
        id_cliente,
        id_direccion_envio,
        id_paqueteria,
        estatus,
        forma_pago,
        subtotal,
        costo_envio,
        total,
        guia_entrega,
        factura,
        notas_administrativas,
        envio_contacto,
        envio_direccion,
        envio_referencias
      });

      res.status(201).json({
        success: true,
        data: laboratorio
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el laboratorio',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un laboratorio existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updatePedido(req, res) {
    try {
      const { id } = req.params;
      const laboratorio = await Laboratorio.findByPk(id);

      if (!laboratorio) {
        return res.status(404).json({
          success: false,
          message: 'Laboratorio no encontrado'
        });
      }
      // Extraer campos del body
      const {nombre} = req.body;
      // Validaciones básicas
      if (nombre !== undefined && (nombre === null || nombre.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del laboratorio no puede estar vacío'
        });
      }

      await laboratorio.update({ nombre });

      res.status(200).json({
        success: true,
        data: laboratorio,
        message: 'Laboratorio actualizado correctamente'
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el laboratorio',
        error: error.message
      });
    }
  }

  /**
   * Elimina un laboratorio por medio de softdelete
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deletePedido(req, res) {
    try {
      const { id } = req.params;
      const laboratorio = await Laboratorio.findByPk(id);
      if (!laboratorio) {
        return res.status(404).json({
          success: false,
          message: 'Laboratorio no encontrado'
        });
      }

      // Buscar si existe al menos un producto activo asociado a este laboratorio
      const { Producto } = require('../config/database.js');
      const productosActivos = await Producto.findOne({
        where: {
          id_laboratorio: id,
          activo: true
        }
      });
      if (productosActivos) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el laboratorio porque tiene productos activos asociados.'
        });
      }

      await laboratorio.update({
        activo: false
      });

      res.status(200).json({
        success: true,
        message: 'Laboratorio eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el laboratorio',
        error: error.message
      });
    }
  }
}

module.exports = PedidoController;