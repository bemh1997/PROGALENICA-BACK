require('dotenv').config();
const { Pedido } = require('../config/database.js');
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
  static async searchPedidos(req, res) {
    try {
      const { query } = req.query;
      const pedidos = await Pedido.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: laboratorios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar los laboratorios',
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
        id_paqueteria, //Ejecutivo
        estatus, //Ejecutivo
        forma_pago, //Formulario
        subtotal, //Se calcula de los pedidos
        costo_envio, //Ejecutivo (?)
        total, // = subtotal + costo_envio
        guia_entrega, //Ejecutivo
        factura, //Ejecutivo (?)
        notas_administrativas, //Ejecutivo (?)
        envio_contacto, //obtenido de id_cliente
        envio_direccion, //obtenido de id_direccion_envio
        envio_referencias,
        // envio_colonia,
        // envio_municipio,
        // envio_estado,
        // envio_codigo_postal,
      } = req.body;

      // Operaciones antes de generar el pedido
      //cálculo de total
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre es obligatorio'
        });
      }

      const laboratorio = await Laboratorio.create({nombre, activo: true});

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
  static async updateLaboratorio(req, res) {
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
  static async deleteLaboratorio(req, res) {
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