require('dotenv').config();
const { DetallePedido, Pedido, Producto } = require('../../config/database.js');
const capitalizeWords = require('../../utils/capitalize.js').capitalizeWords;
const fs = require('fs').promises;
const path = require('path');
class DetalleController {
  /**
   * Obtiene todos los detalles de todos los pedidos 
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllDetalles(req, res) {
    try {
      let detalles = await DetallePedido.findAll({
        order: [['id_detalle_pedido', 'ASC']],
        where: {'activo': true}
      });
      res.status(200).json({
      success: true,
      data: detalles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los detalles de pedidos',
        error: error.message
      });
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getDetalleById(req, res) {
    try {
      const { id } = req.params;
      
      const detalle = await DetallePedido.findByPk(id);

      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Detalle de pedido no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: detalle
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el detalle de pedido',
        error: error.message
      });
    }
  }
  
  /**
   * Obtiene un producto por su nombre
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getDetallesByPedido(req, res) {
    try {
      let { id_pedido } = req.query;
      if (!id_pedido || id_pedido.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El ID de pedido es requerido para la búsqueda'
        });
      }

      const pedido = await Pedido.findByPk(id_pedido);
      if (!pedido) {
        return res.status(400).json({
          success: false,
          message: 'Pedido inexistente'
        });
      }

      const detalles = await DetallePedido.findAll({
        where: {
          id_cliente: id_cliente,
          activo: true
        },
        order: [['id_detalle_pedido', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: detalles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los detalles del pedido',
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva direccion
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createDetalle(req, res) {
    try {
      var { id_pedido,
        id_producto,
        cantidad,
      } = req.body;

      // Validaciones básicas
      const pedido = await Pedido.findByPk(id_pedido);
      if (!pedido) {
        return res.status(400).json({
          success: false,
          message: 'Pedido inexistente'
        });
      }
      
      const producto = await Producto.findByPk(id_producto);
      if (!producto) {
        return res.status(400).json({
          success: false,
          message: 'Producto inexistente'
        });
      }
      
      if (!cantidad ||  isNaN(cantidad) || parseInt(cantidad) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad es requerida y debe ser un número positivo'
        });
      }

      const total = cantidad * producto.precio_venta;

      if (await DetallePedido.findOne({ where: { id_producto: id_producto} })){
        return res.status(400).json({
          success: false,
          message: 'Producto ya ingresado para este detalle de pedido'
        });
      }

      const nuevoDetalle = await DetallePedido.create({
        id_pedido,
        id_producto,
        cantidad,
        total
      });

      res.status(201).json({
        success: true,
        data: nuevoDetalle,
        message: 'Detalle de pedido creado correctamente'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el detalle de pedido',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un producto existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateDetalle(req, res) {
    try {
      const { id } = req.params;
      const detalle = await DetallePedido.findByPk(id);

      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Detalle de pedido no encontrado'
        });
      }

      const {
        cantidad,
      } = req.body;

      // Validaciones básicas
      if (cantidad !== undefined && (cantidad === null ||  isNaN(cantidad) || parseInt(cantidad) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser un número positivo'
        });
      }
      // Preparar objeto de actualización
      const updateData = {};

      if (cantidad !== undefined) updateData.cantidad = cantidad;

      await detalle.update(updateData);

      res.status(200).json({
        success: true,
        data: detalle,
        message: 'Detalle de pedido actualizado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el detalle de pedido',
        error: error.message
      });
    }
  }

  /**
   * Elimina un producto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deleteDetalle(req, res) {
    try {
      const { id } = req.params;
      
      const detalle = await DetallePedido.findByPk(id);
      
      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Detalle de pedido no encontrado'
        });
      }

      await detalle.update({
        activo : false
      });
      
      res.status(200).json({
        success: true,
        message: 'Detalle de pedido eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el detalle de pedido',
        error: error.message
      });
    }
  }
}

module.exports = DetalleController;