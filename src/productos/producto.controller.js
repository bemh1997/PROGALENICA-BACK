require('dotenv').config();
const { Producto } = require('../config/database.js');
const capitalizeWords = require('../utils/capitalize.js').capitalizeWords;
const fs = require('fs').promises;
const path = require('path');
class ProductoController {
  /**
   * Obtiene todos los productos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllProductos(req, res) {
    try {
      let productos = await Producto.findAll({
        order: [['id_producto', 'ASC']],
        where: {'activo': true}
      });
      
      if (productos.length === 0) {
        const jsonPath = path.join(__dirname, process.env.SEED_PATH);
        const data = await fs.readFile(jsonPath, 'utf-8');
        const seed = JSON.parse(data);

        await Producto.bulkCreate(seed);
        productos = await Producto.findAll({
          order: [['id_producto', 'ASC']],
          where: {'activo': true}
        });
      }
      
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
   * Obtiene un producto por su nombre
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getProductoByNombre(req, res) {
    try {
      console.log("holis");
      const { nombre } = req.params;

      const producto = await Producto.findAll({ 
        order: [['nombre', 'DESC']],
        where: {'nombre': nombre, 'activo': true}
       });

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto inexistente'
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
      var { nombre,
              codigo_barras, 
              descripcion: {
                presentacion,
                dosis,
                via_administracion,
                descripcion
              },
              laboratorio,
              precio_unitario, 
              cantidad_real,
              imagen } = req.body;
      
      nombre = capitalizeWords(nombre);

      // Validaciones básicas
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto es requerido'
        });
      }

      if (await Producto.findOne({ where: { nombre: nombre, laboratorio: laboratorio } })){
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto ya se encuentra registrado'
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

      if (!presentacion ) {
        return res.status(400).json({
          success: false,
          message: 'La presentación del producto es requerida'
        });
      }

      if (!dosis ) {
        return res.status(400).json({
          success: false,
          message: 'La dosis del producto es requerida'
        });
      }

      if (!via_administracion ) {
        return res.status(400).json({
          success: false,
          message: 'La vía de administración del producto es requerida'
        });
      }

      if (!descripcion ) {
        return res.status(400).json({
          success: false,
          message: 'La descripción del producto es requerida'
        });
      }

      const nuevoProducto = await Producto.create({
        nombre,
        codigo_barras,
        descripcion: {
                presentacion,
                dosis,
                via_administracion,
                descripcion
              },
        laboratorio,
        precio_unitario,
        cantidad_real,
        imagen
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
      var {
        nombre,
        codigo_barras,
        descripcion:{
          presentacion,
          dosis,
          via_administracion,
          descripcion
        },
        laboratorio,
        precio_unitario,
        cantidad_real,
        imagen } = req.body;
      
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
      
      nombre = capitalizeWords(nombre);      
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
      // if (descripcion !== undefined && (descripcion === null || descripcion.trim() === '')) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La descripción del producto no puede estar vacía'
      //   });
      // }
      
      await producto.update({
        nombre,
        codigo_barras,
        descripcion: {
                presentacion: presentacion? presentacion : producto.descripcion.presentacion,
                dosis: dosis ? dosis: producto.descripcion.dosis,
                via_administracion: via_administracion ? via_administracion : producto.descripcion.via_administracion,
                descripcion: descripcion ? descripcion : producto.descripcion.descripcion
              },
        laboratorio,
        precio_unitario,
        cantidad_real,
        imagen
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