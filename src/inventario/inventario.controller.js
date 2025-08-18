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
      const { id } = req.params;

      const inventario = await Inventario.findAll({
        order: [['id_inventario', 'DESC']],
        where: {
          id_producto: id
        }
      });
      
      const producto = await Producto.findOne({
          where: { id_producto: id }
      });

      if (!producto) {
        return res.status(400).json({
          success: false,
          message: 'Producto inexistente'
        });
      }

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
   * Obtiene las entradas de inventario por producto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getInventarioByProducto(req, res) {
    try {
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
        ubicacion_almacen,
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

      const cantidad_inventario = productoObj.cantidad_real;
      const stock_maximo = productoObj.stock_maximo;

      if (Number(cantidad_inventario) + Number(cantidad_disponible) > Number(stock_maximo)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad total en inventario excede el stock máximo permitido para este producto'
        });
      }

      // if (cantidad_disponible === undefined || isNaN(cantidad_disponible) || cantidad_disponible < 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La cantidad disponible debe ser un número válido y mayor o igual a cero'
      //   });
      // }

      // if (ubicacion_almacen === undefined || ubicacion_almacen.trim() === '') {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La ubicación del almacén es obligatoria'
      //   });
      // }

      const inventario = await Inventario.create({
        id_producto,
        numero_lote,
        fecha_caducidad,
        cantidad_disponible,
        ubicacion_almacen
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
   * Actualiza una entrada de inventario existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateInventario(req, res) {
    try {
      const { id } = req.params;
      const inventario = await Inventario.findByPk(id, {
        include: [{
          model: Producto,
          attributes: ['nombre'],
        }]
      }
    );

      if (!inventario) {
        return res.status(404).json({
          success: false,
          message: 'Inventario no encontrado'
        });
      }

      // Extraer campos del body
      const {
        producto,
        numero_lote,
        fecha_caducidad,
        cantidad_disponible,
        ubicacion_almacen,
      } = req.body;

      const updateData = {};

      if (producto !==undefined)
      {
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
        updateData.id_producto = id_producto;
      }

      //Validaciones básicas

      // const cantidad_inventario = productoObj.cantidad_real;
      // const stock_maximo = productoObj.stock_maximo;
      // const stock_minimo = productoObj.stock_minimo;
      const productoObj = await Producto.findByPk(inventario.id_producto);
      if (cantidad_disponible !== undefined && Number(cantidad_disponible) > inventario.cantidad_disponible && Number(productoObj.cantidad_real) + (Number(cantidad_disponible) - Number(inventario.cantidad_disponible)) > Number(productoObj.stock_maximo)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad total en inventario excede el stock máximo permitido para este producto'
        });
      }

      else if (cantidad_disponible !== undefined && Number(cantidad_disponible) < inventario.cantidad_disponible && Number(productoObj.cantidad_real) - (Number(inventario.cantidad_disponible) - Number(cantidad_disponible)) < Number(productoObj.stock_minimo)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad total en inventario es menor al stock mínimo permitido para este producto'
        });
      }

      if (producto !== undefined && (producto === null || producto.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El nombre/ID del producto no puede estar vacío'
        });
      }

      // if (cantidad_disponible !== undefined && (isNaN(cantidad_disponible) || cantidad_disponible < 0)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La cantidad disponible debe ser un número válido y mayor o igual a cero'
      //   });
      // }


      // if (ubicacion_almacen !== undefined && (ubicacion_almacen.trim() === '' || ubicacion_almacen === null)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La ubicación del almacén es obligatoria'
      //   });
      // }

      // Asignar los campos actualizables
      if (numero_lote !== undefined) updateData.numero_lote = numero_lote;
      if (fecha_caducidad !== undefined) updateData.fecha_caducidad = fecha_caducidad;
      if (cantidad_disponible !== undefined) updateData.cantidad_disponible = cantidad_disponible;
      if (ubicacion_almacen !== undefined) updateData.ubicacion_almacen = ubicacion_almacen;

      await inventario.update(updateData);

      res.status(200).json({
        success: true,
        data: inventario,
        message: 'Inventario actualizado correctamente'
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la entrada de inventario',
        error: error.message
      });
    }
  }

  /**
   * Elimina una entrada de inventario por medio de softdelete
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deleteInventario(req, res) {
    try {
      const { id } = req.params;

      const inventario = await Inventario.findByPk(id);

      if (!inventario) {
        return res.status(404).json({
          success: false,
          message: 'Entrada de inventario no encontrada'
        });
      }

      await inventario.update({
        activo : false
      });
      
      res.status(200).json({
        success: true,
        message: 'Entrada de inventario eliminada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la entrada de inventario',
        error: error.message
      });
    }
  }
}

module.exports = InventarioController;