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
      let { nombre } = req.query;
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre es requerido para la búsqueda'
        });
      }
      nombre = nombre.trim().toLowerCase();
      // Búsqueda insensible a mayúsculas/minúsculas y parcial
      const producto = await Producto.findAll({
        order: [['nombre', 'DESC']],
        where: {
          nombre: { [require('sequelize').Op.iLike]: `%${nombre}%` },
          activo: true
        }
      });
      if (!producto || producto.length === 0) {
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
      const producto = await Producto.findByPk(id);

      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }

      // Extraer campos del body
      const {
        nombre,
        codigo_barras,
        descripcion,
        laboratorio,
        precio_unitario,
        cantidad_real,
        imagen,
        activo
      } = req.body;

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

      // Preparar objeto de actualización
      const updateData = {};

      if (nombre !== undefined) updateData.nombre = capitalizeWords(nombre);
      if (codigo_barras !== undefined) updateData.codigo_barras = codigo_barras;
      if (laboratorio !== undefined) updateData.laboratorio = laboratorio;
      if (precio_unitario !== undefined) updateData.precio_unitario = precio_unitario;
      if (cantidad_real !== undefined) updateData.cantidad_real = cantidad_real;
      if (imagen !== undefined) updateData.imagen = imagen;
      if (activo !== undefined) updateData.activo = activo;

      // Manejar la actualización de la descripción anidada
      if (descripcion !== undefined) {
        // Tomar los valores actuales y solo sobrescribir los enviados
        updateData.descripcion = {
          presentacion: descripcion.presentacion !== undefined ? descripcion.presentacion : producto.descripcion.presentacion,
          dosis: descripcion.dosis !== undefined ? descripcion.dosis : producto.descripcion.dosis,
          via_administracion: descripcion.via_administracion !== undefined ? descripcion.via_administracion : producto.descripcion.via_administracion,
          descripcion: descripcion.descripcion !== undefined ? descripcion.descripcion : producto.descripcion.descripcion
        };
      }

      await producto.update(updateData);

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
}

module.exports = ProductoController;