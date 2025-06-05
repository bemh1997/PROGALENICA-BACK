const dotenv = require('dotenv');
dotenv.config();
const { Producto } = require('../config/database.js');

class ProductoController {
  /**
   * Obtiene todos los productos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllProductos(req, res) {
    try {
      const productos = await Producto.findAll({
        order: [['nombre', 'ASC']]
      });
      
      res.status(200).json({
        success: true,
        data: productos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los productos',
        error: error.message
      });
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getProductoById(req, res) {
    try {
      const { id } = req.params;
      
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: producto
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el producto',
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo producto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createProducto(req, res) {
    try {
      const { nombre,
              codigo_barras, 
              descripcion,
              laboratorio,
              precio_unitario, 
              cantidad_real } = req.body;
      
      // Validaciones básicas
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto es requerido'
        });
      }
      
      if (precio_unitario === undefined || isNaN(precio_unitario) || precio_unitario < 0) {
        return res.status(400).json({
          success: false,
          message: 'El precio unitario debe ser un número válido y mayor o igual a cero'
        });
      }
      
      if (cantidad_real === undefined || isNaN(cantidad_real) || !Number.isInteger(Number(cantidad_real)) || cantidad_real < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad real debe ser un número válido y mayor o igual a cero'
        });
      }
      
      const nuevoProducto = await Producto.create({
        nombre,
        codigo_barras,
        descripcion,
        laboratorio,
        precio_unitario,
        cantidad_real
      });
      
      res.status(201).json({
        success: true,
        data: nuevoProducto,
        message: 'Producto creado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el producto',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un producto existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateProducto(req, res) {
    try {
      const { id } = req.params;
      const { nombre, codigo_barras, descripcion, laboratorio, precio_unitario, cantidad_real } = req.body;
      
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }
      
      // Validaciones básicas
      if (nombre !== undefined && (nombre === null || nombre.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto no puede estar vacío'
        });
      }
      
      if (precio_unitario !== undefined && (isNaN(precio_unitario) || precio_unitario < 0)) {
        return res.status(400).json({
          success: false,
          message: 'El precio unitario debe ser un número válido y mayor o igual a cero'
        });
      }
      
      if (cantidad_real !== undefined && (isNaN(cantidad_real) || cantidad_real < 0)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad real debe ser un número válido y mayor o igual a cero'
        });
      }
      
      await producto.update({
        nombre: nombre !== undefined ? nombre : producto.nombre,
        codigo_barras: codigo_barras !== undefined ? codigo_barras : producto.codigo_barras,
        descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
        laboratorio: laboratorio !== undefined ? laboratorio : producto.laboratorio,
        precio_unitario: precio_unitario !== undefined ? precio_unitario : producto.precio_unitario,
        cantidad_real: cantidad_real !== undefined ? cantidad_real : producto.cantidad_real
      });
      
      res.status(200).json({
        success: true,
        data: producto,
        message: 'Producto actualizado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el producto',
        error: error.message
      });
    }
  }

  /**
   * Elimina un producto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deleteProducto(req, res) {
    try {
      const { id } = req.params;
      
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }
      
      await producto.update({
        activo : false})
      
      res.status(200).json({
        success: true,
        message: 'Producto eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el producto',
        error: error.message
      });
    }
  }
  // /**
  //  * Elimina un producto
  //  * @param {Object} req - Objeto de solicitud Express
  //  * @param {Object} res - Objeto de respuesta Express
  //  */
  // static async deleteProducto(req, res) {
  //   try {
  //     const { id } = req.params;
      
  //     const producto = await Producto.findByPk(id);
      
  //     if (!producto) {
  //       return res.status(404).json({
  //         success: false,
  //         message: 'Producto no encontrado'
  //       });
  //     }
      
  //     await producto.destroy();
      
  //     res.status(200).json({
  //       success: true,
  //       message: 'Producto eliminado correctamente'
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message: 'Error al eliminar el producto',
  //       error: error.message
  //     });
  //   }
  // }

  /**
   * Busca productos por nombre o código de barras
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async searchProductos(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un término de búsqueda'
        });
      }
      
      const productos = await Producto.findAll({
        where: {
          [Sequelize.Op.or]: [
            { nombre: { [Sequelize.Op.iLike]: `%${query}%` } },
            { codigo_barras: { [Sequelize.Op.iLike]: `%${query}%` } }
          ]
        },
        order: [['nombre', 'ASC']]
      });
      
      res.status(200).json({
        success: true,
        data: productos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar productos',
        error: error.message
      });
    }
  }
}

module.exports = ProductoController;