require('dotenv').config();
const { Producto, Laboratorio } = require('../config/database.js');
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
        where: {'activo': true},
        include: [{
          model: Laboratorio,
          attributes: ['nombre'],
        }]
      });

      if (productos.length === 0) {
        let laboratorios = await Laboratorio.findAll({
          order: [['id_laboratorio', 'ASC']],
          where: {'activo': true}
        });
        if (laboratorios.length === 0) {
          const jsonLabsPath = path.join(__dirname, process.env.SEED_LABS_PATH);
          const dataLabs = await fs.readFile(jsonLabsPath, 'utf-8');
          const seedLabs = JSON.parse(dataLabs);
          await Laboratorio.bulkCreate(seedLabs);
        }
        const jsonProductsPath = path.join(__dirname, process.env.SEED_PRODUCTS_PATH);
        const dataProducts = await fs.readFile(jsonProductsPath, 'utf-8');
        let seedProducts = JSON.parse(dataProducts);

        // Enlazar laboratorio por nombre antes de crear productos
        for (const prod of seedProducts) {
          if (prod.laboratorio) {
            const lab = await Laboratorio.findOne({
              where: { nombre: { [require('sequelize').Op.iLike]: prod.laboratorio } }
            });
            if (lab) {
              prod.id_laboratorio = lab.id_laboratorio;
            }
          }
          delete prod.laboratorio; // Elimina el campo laboratorio por nombre
        }

        await Producto.bulkCreate(seedProducts);
        productos = await Producto.findAll({
          order: [['id_producto', 'ASC']],
          where: {'activo': true},
          include: [{
            model: Laboratorio,
            attributes: ['nombre'],
          }]
        });
      }

      // Transformar la respuesta para que laboratorio sea un string
      const productosTransformados = productos.map(prod => {
        const plain = prod.get({ plain: true });
        // Eliminar el campo Laboratorio y dejar solo laboratorio como string
        const { Laboratorio, ...rest } = plain;
        return {
          ...rest,
          laboratorio: Laboratorio ? Laboratorio.nombre : null
        };
      });
      res.status(200).json({
        success: true,
        data: productosTransformados
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
      
      const producto = await Producto.findByPk(id, {
        include: [{
          model: Laboratorio,
          attributes: ['nombre'],
        }]
      });
      
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: 'Producto no encontrado'
        });
      }
      
      // Transformar la respuesta para que laboratorio sea un string y eliminar duplicidad
      let prodTransformado = null;
      if (producto) {
        const plain = producto.get({ plain: true });
        const { Laboratorio, ...rest } = plain;
        prodTransformado = {
          ...rest,
          laboratorio: Laboratorio ? Laboratorio.nombre : null
        };
      }
      res.status(200).json({
        success: true,
        data: prodTransformado
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
        presentacion,
        concentracion,
        via_administracion,
        descripcion,
        laboratorio,
        precio_venta,
        temperatura_conservacion,
        receta_medica,
        clasificacion,
        ficha_tecnica,
        principio_activo,
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

      // Validar que laboratorio sea requerido
      if (!laboratorio || laboratorio.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El laboratorio es requerido'
        });
      }

      // Buscar laboratorio por id o nombre
      let laboratorioObj = null;
      // Si es un UUID (id), busca por PK
      if (/^[0-9a-fA-F\-]{36}$/.test(laboratorio)) {
        laboratorioObj = await Laboratorio.findByPk(laboratorio);
      } else {
        // Si no, busca por nombre (insensible a mayúsculas/minúsculas)
        laboratorioObj = await Laboratorio.findOne({
          where: { nombre: { [require('sequelize').Op.iLike]: laboratorio } }
        });
      }

      if (!laboratorioObj) {
        return res.status(400).json({
          success: false,
          message: 'Laboratorio inexistente'
        });
      }
      // Crear producto
      
      const id_laboratorio = laboratorioObj.id_laboratorio; // Usar este PK para el producto

      if (await Producto.findOne({ where: { nombre: nombre, id_laboratorio: id_laboratorio } })){
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto ya se encuentra registrado'
        });
      }
      
      if (precio_venta === undefined || isNaN(precio_venta) || precio_venta < 0) {
        return res.status(400).json({
          success: false,
          message: 'El precio de venta debe ser un número válido y mayor o igual a cero'
        });
      }
      
      if (cantidad_real === undefined || isNaN(cantidad_real) || !Number.isInteger(Number(cantidad_real)) || cantidad_real < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad real debe ser un número válido y mayor o igual a cero'
        });
      }

      if (!concentracion ) {
        return res.status(400).json({
          success: false,
          message: 'La concentración del producto es requerida'
        });
      }

      // if (!temperatura_conservacion ) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La temperatura de conservación del producto es requerida'
      //   });
      // }

      // if (!clasificacion ) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La clasificación del producto es requerida'
      //   });
      // }

      if (!principio_activo ) {
        return res.status(400).json({
          success: false,
          message: 'El principio activo del producto es requerido'
        });
      }

      // if (!ficha_tecnica ) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La ficha técnica del producto es requerida'
      //   });
      // }

      // if (!receta_medica ) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La especificación de si el producto requiere receta médica es requerida'
      //   });
      // }

      if (!presentacion ) {
        return res.status(400).json({
          success: false,
          message: 'La presentación del producto es requerida'
        });
      }

      if (!concentracion ) {
        return res.status(400).json({
          success: false,
          message: 'La concentracion del producto es requerida'
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
        presentacion,
        concentracion,
        via_administracion,
        descripcion,
        id_laboratorio,
        precio_venta,
        temperatura_conservacion,
        receta_medica,
        clasificacion,
        ficha_tecnica,
        principio_activo, 
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
        id_laboratorio,
        precio_venta,
        cantidad_real,
        temperatura_conservacion,
        receta_medica,
        clasificacion,
        ficha_tecnica,
        principio_activo, 
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

      const laboratorio = await Laboratorio.findByPk(id_laboratorio);
      if (!laboratorio && id_laboratorio !== undefined) {
        return res.status(400).json({
          success: false,
          message: 'Laboratorio inexistente'
        });
      }

      if (id_laboratorio !== undefined && (id_laboratorio === null || id_laboratorio.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del laboratorio no puede estar vacío'
        });
      }

      if (precio_venta !== undefined && (isNaN(precio_venta) || precio_venta < 0)) {
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
      if (id_laboratorio !== undefined) updateData.id_laboratorio = id_laboratorio;
      if (precio_venta !== undefined) updateData.precio_venta = precio_venta;
      if (cantidad_real !== undefined) updateData.cantidad_real = cantidad_real;
      if (temperatura_conservacion !== undefined) updateData.temperatura_conservacion = temperatura_conservacion;
      if (receta_medica !== undefined) updateData.receta_medica = receta_medica;
      if (clasificacion !== undefined) updateData.clasificacion = clasificacion;
      if (ficha_tecnica !== undefined) updateData.ficha_tecnica = ficha_tecnica;
      if (principio_activo !== undefined) updateData.principio_activo = principio_activo;
      if (imagen !== undefined) updateData.imagen = imagen;
      if (activo !== undefined) updateData.activo = activo;

      // Manejar la actualización de la descripción anidada
      if (descripcion !== undefined) {
        // Tomar los valores actuales y solo sobrescribir los enviados
        updateData.descripcion = {
          presentacion: descripcion.presentacion !== undefined ? descripcion.presentacion : producto.descripcion.presentacion,
          concentracion: descripcion.concentracion !== undefined ? descripcion.concentracion : producto.descripcion.concentracion,
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