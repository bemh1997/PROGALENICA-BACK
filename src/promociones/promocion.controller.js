require('dotenv').config();
const { Promocion , Producto} = require('../config/database.js');
const fs = require('fs').promises;
const path = require('path');
class PromocionController {
  /**
   * Obtiene todas las promociones
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllPromociones(req, res) {
    try {
      let promociones = await Promocion.findAll({
        order: [['id_promocion', 'ASC']]
      });
      res.status(200).json({
        success: true,
        data: promociones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las promociones',
        error: error.message
      });
    }
  }

    /**
   * Obtiene una promocion por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getPromocionById(req, res) {
    try {
      const { id } = req.params;

      const promocion = await Promocion.findByPk(id, {
        include: [{
          model: Producto,
          attributes: ['nombre'],
        }]
      });
      
      if (!promocion) {
        return res.status(404).json({
          success: false,
          message: 'Promocion inexistente'
        });
      }
      
      res.status(200).json({
        success: true,
        data: promocion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la promocion',
        error: error.message
      });
    }
  }
  
  /**
   * Obtiene una promocion por producto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getPromocionByProducto(req, res) {
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

      const promociones = await Promocion.findAll({
        order: [['id_promocion', 'DESC']],
        where: {
          id_producto: id_producto
        }
      });

      if (!promociones || promociones.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Este producto no tiene promociones activas'
        });
      }

      res.status(200).json({
        success: true,
        data: inventario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las promociones por producto',
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva promoción
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createPromocion(req, res) {
    try {
      const {
        producto,
        tipo_promocion,
        descripcion,
        unidades_requeridas,
        unidades_obsequiadas,
        cantidad_descuento,
        porcentaje_descuento,
        minimo_compra,
        acumulable
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

      if (tipo_promocion === undefined || isNaN(tipo_promocion) || tipo_promocion < 0 || tipo_promocion > 4 ) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de promoción debe ser un número válido entre 0 y 4'
        });
      }

      switch (tipo_promocion) {
        case 1: // X x Y
          if (unidades_requeridas === undefined || isNaN(unidades_requeridas) || unidades_requeridas < 0) {
            return res.status(400).json({
              success: false,
              message: 'Las unidades requeridas deben ser un número válido y mayor o igual a cero'
            });
          }
          if (unidades_obsequiadas === undefined || isNaN(unidades_obsequiadas) || unidades_obsequiadas < 0) {
            return res.status(400).json({
              success: false,
              message: 'Las unidades obsequiadas deben ser un número válido y mayor o igual a cero'
            });
          }
          if (unidades_obsequiadas >= unidades_requeridas) {
            return res.status(400).json({
              success: false,
              message: 'Las unidades obsequiadas deben ser un número válido y menor a las unidades requeridas'
            });
          }
          break;
        case 2: // Descuento fijo
          if (cantidad_descuento === undefined || isNaN(cantidad_descuento) || cantidad_descuento < 0) {
            return res.status(400).json({
              success: false,
              message: 'El descuento fijo debe ser un número válido y mayor o igual a cero'
            });
          }
          break;
        case 3: // Porcentaje de descuento
          if (porcentaje_descuento === undefined || isNaN(porcentaje_descuento) || porcentaje_descuento < 0) {
            return res.status(400).json({
              success: false,
              message: 'El porcentaje de descuento debe ser un número válido y mayor o igual a cero'
            });
          }
          break;
        case 4: // Mínimo de compra
          if (minimo_compra === undefined || isNaN(minimo_compra) || minimo_compra < 0) {
            return res.status(400).json({
              success: false,
              message: 'El mínimo de compra debe ser un número válido y mayor o igual a cero'
            });
          }
          if (cantidad_descuento === undefined || isNaN(cantidad_descuento) || cantidad_descuento < 0) {
            return res.status(400).json({
              success: false,
              message: 'La cantidad descontada debe ser un número válido y mayor o igual a cero'
            });
          }
          break;
        }

      // if (descripcion === undefined || descripcion.trim() === '') {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La descripción de la promoción es obligatoria'
      //   });
      // }

      const promocion = await Promocion.create({
        id_producto,
        tipo_promocion,
        descripcion,
        unidades_requeridas,
        unidades_obsequiadas,
        cantidad_descuento,
        porcentaje_descuento,
        minimo_compra,
        acumulable
      });

      res.status(201).json({
        success: true,
        data: promocion
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la promoción',
        error: error.message
      });
    }
  }

  /**
   * Actualiza una promoción existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updatePromocion(req, res) {
    try {
      const { id } = req.params;
      const promocion = await Promocion.findByPk(id, {
        include: [{
          model: Producto,
          attributes: ['nombre'],
        }]
      }
    );

      if (!promocion) {
        return res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
      }

      // Extraer campos del body
      const {
        producto,
        tipo_promocion,
        descripcion,
        unidades_requeridas,
        unidades_obsequiadas,
        cantidad_descuento,
        porcentaje_descuento,
        minimo_compra,
        acumulable
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
      if (producto !== undefined && (producto === null || producto.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El nombre/ID del producto no puede estar vacío'
        });
      }

      

      if (tipo_promocion === undefined && (isNaN(tipo_promocion) || (tipo_promocion < 0 && tipo_promocion > 4)) ) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de promoción debe ser un número válido entre 0 y 4'
        });
      }

      if (tipo_promocion !== undefined)
      {
        switch (tipo_promocion) {
          case 1: // X x Y
            if (unidades_requeridas === undefined && ( isNaN(unidades_requeridas) || unidades_requeridas < 0) ){
              return res.status(400).json({
                success: false,
                message: 'Las unidades requeridas deben ser un número válido y mayor o igual a cero'
              });
            }
            else updateData.unidades_requeridas = unidades_requeridas;
            if (unidades_obsequiadas === undefined && ( isNaN(unidades_obsequiadas) || unidades_obsequiadas < 0)) {
              return res.status(400).json({
                success: false,
                message: 'Las unidades obsequiadas deben ser un número válido y mayor o igual a cero'
              });
            }
            else updateData.unidades_obsequiadas = unidades_obsequiadas;
            break;
          case 2: // Descuento fijo
            if (cantidad_descuento === undefined && (isNaN(cantidad_descuento) || cantidad_descuento < 0)) {
              return res.status(400).json({
                success: false,
                message: 'El descuento fijo debe ser un número válido y mayor o igual a cero'
              });
            }
            else updateData.cantidad_descuento = cantidad_descuento;
            break;
          case 3: // Porcentaje de descuento
            if (porcentaje_descuento === undefined && (isNaN(porcentaje_descuento) || porcentaje_descuento < 0)) {
              return res.status(400).json({
                success: false,
                message: 'El porcentaje de descuento debe ser un número válido y mayor o igual a cero'
              });
            }
            else updateData.porcentaje_descuento = porcentaje_descuento;
            break;
          case 4: // Mínimo de compra
            if (minimo_compra === undefined && (isNaN(minimo_compra) || minimo_compra < 0)) {
              return res.status(400).json({
                success: false,
                message: 'El mínimo de compra debe ser un número válido y mayor o igual a cero'
              });
            }
            else updateData.minimo_compra = minimo_compra;
            if (cantidad_descuento === undefined && (isNaN(cantidad_descuento) || cantidad_descuento < 0)) {
              return res.status(400).json({
                success: false,
                message: 'El descuento fijo debe ser un número válido y mayor o igual a cero'
              });
            }
            else updateData.cantidad_descuento = cantidad_descuento;
            break;
        }
      }

      // if (descripcion === undefined || descripcion.trim() === '') {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La descripción de la promoción es obligatoria'
      //   });
      // }

      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (acumulable !== undefined) updateData.acumulable = acumulable;

      await promocion.update(updateData);

      res.status(200).json({
        success: true,
        data: promocion,
        message: 'Promoción actualizada correctamente'
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la promoción',
        error: error.message
      });
    }
  }

  /**
   * Elimina una promoción por medio de softdelete
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deletePromocion(req, res) {
    try {
      const { id } = req.params;

      const promocion = await Promocion.findByPk(id);

      if (!promocion) {
        return res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
      }

      await promocion.update({
        activo : false
      });
      
      res.status(200).json({
        success: true,
        message: 'Promoción eliminada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la promoción',
        error: error.message
      });
    }
  }
}

module.exports = PromocionController;