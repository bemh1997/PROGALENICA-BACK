require('dotenv').config();
const { Inventario , Producto} = require('../config/database.js');
const fs = require('fs').promises;
const path = require('path');
class InventarioController {
  /**
   * Obtiene todos los inventarios
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllInventarios(req, res) {
    try {
      let inventarios = await Inventario.findAll({
        order: [['id_inventario', 'ASC']]
      });
      res.status(200).json({
        success: true,
        data: inventarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los inventarios',
        error: error.message
      });
    }
  }

    /**
   * Obtiene un producto por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getInventarioById(req, res) {
    try {
      console.log("Buscando inventario por ID");
      const { id } = req.params;

      const inventario = await Inventario.findByPk(id, {
        include: [{
          model: Producto,
          attributes: ['nombre'],
        }]
      });
      
      if (!inventario) {
        return res.status(404).json({
          success: false,
          message: 'Inventario inexistente'
        });
      }
      
      res.status(200).json({
        success: true,
        data: inventario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el inventario',
        error: error.message
      });
    }
  }
  
  /**
   * Obtiene un producto por su nombre
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getInventarioByProducto(req, res) {
    try {
      console.log("entrando al getInventarioByProducto");
      let { producto } = req.query;
      if (!producto || producto.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto es requerido para la búsqueda'
        });
      }

       // Buscar producto por id o nombre
      let productoObj = null;
      // Si es un UUID (id), busca por PK
      if (/^[0-9a-fA-F\-]{36}$/.test(producto)) {
        productoObj = await Producto.findByPk(producto);
      } else {
        // Si no, busca por nombre (insensible a mayúsculas/minúsculas)
        productoObj = await Producto.findOne({
          where: { nombre: { [require('sequelize').Op.iLike]: producto } }
        });
      }

      if (!productoObj) {
        return res.status(400).json({
          success: false,
          message: 'Producto inexistente'
        });
      }

      const id_producto = productoObj.id_producto; // Usar este PK para el producto

      const inventario = await Inventario.findAll({
        order: [['id_inventario', 'DESC']],
        where: {
          id_producto: id_producto
        }
      });

      if (!inventario || inventario.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Este producto no existe en el inventario'
        });
      }

      res.status(200).json({
        success: true,
        data: inventario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el inventario por producto',
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva entrada en inventario
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createInventario(req, res) {
    try {
      const {
        producto,
        numero_lote,
        fecha_caducidad,
        cantidad_disponible,
        stock_minimo,
        stock_maximo,
        ubicacion_almacen,
        costo_unitario,
        iva_aplicable,
      } = req.body;

       // Validar que producto no este vacío
      if (!producto || producto.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El producto es requerido'
        });
      }

      //buscar producto por id o nombre
      let productoObj = null;
      //si es un UUID válido, busca por id
      if (/^[0-9a-fA-F\-]{36}$/.test(producto)) {
        productoObj = await Producto.findByPk(producto);
      } else {
        // Si no, busca por nombre (insensible a mayúsculas/minúsculas)
        productoObj = await Producto.findOne({
          where: { nombre: { [require('sequelize').Op.iLike]: producto } }
        });
      }

      if (!productoObj) {
        return res.status(400).json({
          success: false,
          message: 'Producto inexistente'
        });
      }

      const id_producto = productoObj.id_producto; // Usar este PK para el producto

      // Validaciones de campos obligatorios
      if (!numero_lote || numero_lote.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El lote es obligatorio'
        });
      }

      if (!fecha_caducidad || fecha_caducidad.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'La fecha de caducidad es obligatoria'
        });
      }

      if (cantidad_disponible === undefined || isNaN(cantidad_disponible) || cantidad_disponible < 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad disponible debe ser un número válido y mayor o igual a cero'
        });
      }

      if (cantidad_disponible === undefined || isNaN(cantidad_disponible) || cantidad_disponible < 0) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad disponible debe ser un número válido y mayor o igual a cero'
        });
      }

      if (stock_maximo === undefined || isNaN(stock_maximo) || stock_maximo < 0) {
        return res.status(400).json({
          success: false,
          message: 'El stock máximo debe ser un número válido y mayor o igual a cero'
        });
      }

      if (stock_minimo === undefined || isNaN(stock_minimo) || stock_minimo < 0) {
        return res.status(400).json({
          success: false,
          message: 'El stock mínimo debe ser un número válido y mayor o igual a cero'
        });
      }

      if (costo_unitario === undefined || isNaN(costo_unitario) || costo_unitario < 0) {
        return res.status(400).json({
          success: false,
          message: 'El costo unitario debe ser un número válido y mayor o igual a cero'
        });
      }

      if (ubicacion_almacen === undefined || ubicacion_almacen.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'La ubicación del almacén es obligatoria'
        });
      }

      if (iva_aplicable === undefined || isNaN(iva_aplicable) || iva_aplicable < 0) {
        return res.status(400).json({
          success: false,
          message: 'El IVA aplicable debe ser un número válido y mayor o igual a cero'
        });
      }

      const inventario = await Inventario.create({
        id_producto,
        numero_lote,
        fecha_caducidad,
        cantidad_disponible,
        stock_minimo,
        stock_maximo,
        ubicacion_almacen,
        costo_unitario,
        iva_aplicable
      });

      res.status(201).json({
        success: true,
        data: inventario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la entrada de inventario',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un laboratorio existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateInventario(req, res) {
    try {
      const { id_inventario } = req.params;
      const inventario = await Inventario.findByPk(id_inventario);

      if (!inventario) {
        return res.status(404).json({
          success: false,
          message: 'Inventario no encontrado'
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

      await laboratorio.update(updateData);

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

      await laboratorio.update({
        activo : false
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

module.exports = InventarioController;