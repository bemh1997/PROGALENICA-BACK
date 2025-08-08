require('dotenv').config();
const { Producto, Laboratorio, Inventario } = require('../config/database.js');
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
        include: [
          {
            model: Laboratorio,
            attributes: ['nombre'],
          },
          {
            model: Inventario,
            attributes: [
              'numero_lote',
              'fecha_caducidad',
              'cantidad_disponible',
              'ubicacion_almacen'
            ],
          }
        ]
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

          if (prod.costo_unitario && prod.iva_aplicable !== undefined) {
            const costo = Number(prod.costo_unitario);
            const iva = Number(prod.iva_aplicable);
            prod.precio_venta = costo + (costo * (iva / 100));
          }
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

        for (const prod of seedProducts) {
          const productoCreado = await Producto.findOne({
            where: { nombre: prod.nombre }
          });

          if (productoCreado && prod.cantidad_disponible) {
            await Inventario.create({
              id_producto: productoCreado.id_producto,
              cantidad_disponible: prod.cantidad_disponible,
              ubicacion_almacen: prod.ubicacion_almacen || '',
              numero_lote: prod.numero_lote || '',
              fecha_caducidad: prod.fecha_caducidad || null
            });
          }
        }

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
        codigo_sat,
        presentacion,
        concentracion,
        via_administracion,
        descripcion,
        laboratorio,
        temperatura_conservacion,
        receta_medica,
        clasificacion,
        ficha_tecnica,
        principio_activo,
        costo_unitario,
        iva_aplicable,
        stock_minimo,
        stock_maximo,
        cantidad_real,
        numero_lote,
        fecha_caducidad,
        cantidad_disponible,
        ubicacion_almacen,
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
      const precio_venta = Number(costo_unitario) + (Number(costo_unitario) * (Number(iva_aplicable) / 100));

      if (await Producto.findOne({ where: { nombre: nombre, id_laboratorio: id_laboratorio } })){
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto ya se encuentra registrado'
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

      if (!concentracion ) {
        return res.status(400).json({
          success: false,
          message: 'La concentración del producto es requerida'
        });
      }

      if (!principio_activo ) {
        return res.status(400).json({
          success: false,
          message: 'El principio activo del producto es requerido'
        });
      }
      
      // if (cantidad_real === undefined || isNaN(cantidad_real) || !Number.isInteger(Number(cantidad_real)) || cantidad_real < 0
      // ) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'La cantidad real debe ser un número válido y mayor o igual a cero'
      //   });
      // }

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
      
      if (!codigo_sat || codigo_sat.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El código SAT del producto es requerido'
        });
      }

      if (costo_unitario === undefined || isNaN(costo_unitario) || costo_unitario < 0) {
        return res.status(400).json({
          success: false,
          message: 'El costo unitario debe ser un número válido y mayor o igual a cero'
        });
      }

      if (iva_aplicable === undefined || isNaN(iva_aplicable) || iva_aplicable < 0) {
        return res.status(400).json({
          success: false,
          message: 'El IVA aplicable debe ser un número válido y mayor o igual a cero'
        });
      }

      if (Number(cantidad_disponible) < Number(stock_minimo)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad disponible no puede ser menor que el stock mínimo'
        });
      }

      if (Number(cantidad_disponible) > Number(stock_maximo)) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad disponible no puede ser mayor que el stock máximo'
        });
      }

      const nuevoProducto = await Producto.create({
        nombre,
        codigo_barras,
        codigo_sat,
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
        iva_aplicable,
        costo_unitario,
        principio_activo, 
        cantidad_real,
        stock_maximo,
        stock_minimo,
        imagen
      });
      
      const inventarioNuevo = await Inventario.create({
        id_producto: nuevoProducto.id_producto,
        numero_lote,
        fecha_caducidad,
        cantidad_disponible,
        ubicacion_almacen,
      });

      res.status(201).json({
        success: true,
        data: {
          producto: nuevoProducto,
          inventario: inventarioNuevo
        },
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
        codigo_sat,
        descripcion,
        presentacion,
        concentracion,
        via_administracion,
        id_laboratorio,
        precio_venta,
        cantidad_real,
        temperatura_conservacion,
        receta_medica,
        clasificacion,
        ficha_tecnica,
        iva_aplicable,
        costo_unitario,
        principio_activo, 
        stock_minimo,
        stock_maximo,
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

      if (costo_unitario !== undefined && (isNaN(costo_unitario) || costo_unitario < 0)) {
        return res.status(400).json({
          success: false,
          message: 'El costo unitario debe ser un número válido y mayor o igual a cero'
        });
      }

      if (iva_aplicable !== undefined && (isNaN(iva_aplicable) || iva_aplicable < 0)) {
        return res.status(400).json({
          success: false,
          message: 'El IVA aplicable debe ser un número válido y mayor o igual a cero'
        });
      }

      if (stock_maximo !== undefined && (isNaN(stock_maximo) || stock_maximo < 0)) {
        return res.status(400).json({
          success: false,
          message: 'El stock máximo debe ser un número válido y mayor o igual a cero'
        });
      }

      if (stock_minimo !== undefined && (isNaN(stock_minimo) || stock_minimo < 0)) {
        return res.status(400).json({
          success: false,
          message: 'El stock mínimo debe ser un número válido y mayor o igual a cero'
        });
      }

      // Preparar objeto de actualización
      const updateData = {};

      if (nombre !== undefined) updateData.nombre = capitalizeWords(nombre);
      if (codigo_barras !== undefined) updateData.codigo_barras = codigo_barras;
      if (codigo_sat !== undefined) updateData.codigo_sat = codigo_sat;
      if (id_laboratorio !== undefined) updateData.id_laboratorio = id_laboratorio;
      if (precio_venta !== undefined) updateData.precio_venta = precio_venta;
      if (cantidad_real !== undefined) updateData.cantidad_real = cantidad_real;
      if (temperatura_conservacion !== undefined) updateData.temperatura_conservacion = temperatura_conservacion;
      if (receta_medica !== undefined) updateData.receta_medica = receta_medica;
      if (clasificacion !== undefined) updateData.clasificacion = clasificacion;
      if (ficha_tecnica !== undefined) updateData.ficha_tecnica = ficha_tecnica;
      if (principio_activo !== undefined) updateData.principio_activo = principio_activo;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (concentracion !== undefined) updateData.concentracion = concentracion;
      if (presentacion !== undefined) updateData.presentacion = presentacion;
      if (via_administracion !== undefined) updateData.via_administracion = via_administracion;
      if (imagen !== undefined) updateData.imagen = imagen;
      if (costo_unitario !== undefined) updateData.costo_unitario = costo_unitario;
      if (iva_aplicable !== undefined) updateData.iva_aplicable = iva_aplicable;
      if (stock_maximo !== undefined) updateData.stock_maximo = stock_maximo;
      if (stock_minimo !== undefined) updateData.stock_minimo = stock_minimo;
      if (activo !== undefined) updateData.activo = activo;
      
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