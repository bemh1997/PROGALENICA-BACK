require('dotenv').config();
const { Client } = require('pg');
const { Pedido, Cliente, Direccion, Usuario, DetallePedido, Producto } = require('../config/database.js');
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
        where: { activo: true },
        include: [
          {
            model: DetallePedido,
            attributes: ['cantidad', 'total'],
            include: [
              {
                model: Producto,
                attributes: ['nombre', 'precio_venta', 'presentacion'],
              },
            ],
          },
        ],
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
   * Busca pedidos por cliente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */

  static async getPedidosByUser(req, res) {
    try {
      const { id } = req.query;

      const cliente = await Cliente.findByPk(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      const pedidos = await Pedido.findAll({
        order: [['id_pedido', 'DESC']],
        where: {
          id_cliente: id
        }
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
   * Busca pedidos por ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */

  static async getPedidoById(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findOne({
        where: { id_pedido: id },
        include: [
          {
            model: DetallePedido,
            attributes: ['cantidad', 'total', 'id_producto'],
            include: [
              {
                model: Producto,
                // Selecciona los atributos que quieres mostrar del producto
                attributes: ['nombre', 'precio_venta', 'presentacion'],
              },
            ],
          },
        ],
      });

      res.status(200).json({
        success: true,
        data: pedido
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Pedido inexistente',
        error: error.message
      });
    }
  }

  /**
   * Genera un nuevo pedido
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createPedido(req, res) {
    try {
      const {
        id_cliente, //dentro de la sesión, no en formulario
        id_direccion_envio, //dentro de la sesión, en formulario (sin validación)
        // id_paqueteria, //Ejecutivo
        // estatus, //Ejecutivo
        forma_pago, //Formulario
        id_producto,
        cantidad,
        // costo_envio, //Ejecutivo
        // total, // = subtotal + costo_envio
        // guia_entrega, //Ejecutivo
        // factura, //Ejecutivo
        // notas_administrativas, //Ejecutivo
        // envio_contacto, //obtenido de id_cliente
        // envio_direccion, //obtenido de id_direccion_envio
        // envio_referencias, //obtenido de id_direccion_envio
        // envio_colonia,
        // envio_municipio,
        // envio_estado,
        // envio_codigo_postal,
      } = req.body;

      // Validaciones:
      
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
      const subtotal = total;

      if (await DetallePedido.findOne({ where: { id_producto: id_producto} })){
        return res.status(400).json({
          success: false,
          message: 'Producto ya ingresado para este detalle de pedido'
        });
      }

      // Operaciones antes de generar el pedido
      const cliente = await Cliente.findByPk(id_cliente);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      const userpkey = cliente.id_usuario;
      const user = await Usuario.findByPk(userpkey);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      let envio_contacto = `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno} Tel. ${user.telefono}`;

      let envio_direccion;
      const direccion = await Direccion.findByPk(id_direccion_envio);
      if (!direccion) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
      }

      if (direccion.numero_interior === null) 
        envio_direccion = `${direccion.calle} No. ${direccion.numero_exterior}, colonia ${direccion.colonia} C.P. ${direccion.codigo_postal}. ${direccion.municipio}, ${direccion.estado}`;
      else
        envio_direccion = `${direccion.calle} No. ${direccion.numero_exterior} Int. ${direccion.numero_interior}, colonia ${direccion.colonia} C.P. ${direccion.codigo_postal}. ${direccion.municipio}, ${direccion.estado}`;

      let envio_referencias = direccion.referencias;

      const pedido = await Pedido.create({
        id_cliente,
        id_direccion_envio,
        forma_pago,
        subtotal,
        envio_contacto,
        envio_direccion,
        envio_referencias
      });

      const detalle = await DetallePedido.create({
        id_pedido: pedido.id_pedido,
        id_producto,
        cantidad,
        total
      });

      res.status(201).json({
        success: true,
        data: {
          pedido: pedido,
          detalle: detalle
        },
        message: 'Pedido creado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al generar el pedido',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un pedido existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updatePedido(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findByPk(id);

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      const {
        estatus,
        id_paqueteria,
        costo_envio,
        guia_entrega,
        factura,
        notas_administrativas,
        activo
      } = req.body;

      const updateData = {};

      if (estatus !== undefined) updateData.estatus = estatus;
      if (id_paqueteria !== undefined) updateData.id_paqueteria = id_paqueteria;
      if (costo_envio !== undefined) updateData.costo_envio = costo_envio;
      if (guia_entrega !== undefined) updateData.guia_entrega = guia_entrega;
      if (factura !== undefined) updateData.factura = factura;
      if (notas_administrativas !== undefined) updateData.notas_administrativas = notas_administrativas;
      if (activo !== undefined) updateData.activo = activo;

      // Aquí se podrían agregar validaciones más complejas si es necesario

      await pedido.update(updateData);

      res.status(200).json({
        success: true,
        data: pedido,
        message: 'Pedido actualizado correctamente'
      });
    } 
    catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el pedido',
        error: error.message
      });
    }
  }

  /**
   * Elimina un pedido por medio de softdelete
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deletePedido(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.findByPk(id);
      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }

      await pedido.update({
        activo: false
      });

      res.status(200).json({
        success: true,
        message: 'Pedido eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el pedido',
        error: error.message
      });
    }
  }
}

module.exports = PedidoController;