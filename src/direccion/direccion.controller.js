require('dotenv').config();
const { Direccion, Cliente } = require('../config/database.js');
const capitalizeWords = require('../utils/capitalize.js').capitalizeWords;
const fs = require('fs').promises;
const path = require('path');
class DireccionController {
  /**
   * Obtiene todas las direcciones
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllDirecciones(req, res) {
    try {
      let direcciones = await Direccion.findAll({
        order: [['id_direccion', 'ASC']],
        where: {'activo': true}//,
        // include: [
        //   {
        //     model: Cliente,
        //     attributes: [
        //       'nombre',
        //       'apellido_paterno',
        //       'apellido_materno'
        //     ],
        //   }
        // ]
      });
      res.status(200).json({
      success: true,
      data: direcciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las direcciones',
        error: error.message
      });
    }
  }

  /**
   * Obtiene un producto por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getDireccionById(req, res) {
    try {
      const { id } = req.params;
      
      const direccion = await Direccion.findByPk(id//, {
        // include: [{
        //   model: Cliente,
        //     attributes: [
        //       'nombre',
        //       'apellido_paterno',
        //       'apellido_materno'
        //     ],
        // }]
      //}
    );

      if (!direccion) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: direccion
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la dirección',
        error: error.message
      });
    }
  }
  
  /**
   * Obtiene un producto por su nombre
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getDireccionesByCliente(req, res) {
    try {
      let { id_cliente } = req.query;
      if (!id_cliente || id_cliente.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El ID de cliente es requerido para la búsqueda'
        });
      }
      
      const cliente = await Cliente.findByPk(id_cliente);
      if (!cliente) {
        return res.status(400).json({
          success: false,
          message: 'Cliente inexistente'
        });
      }

      const direcciones = await Direccion.findAll({
        where: {
          id_cliente: id_cliente,
          activo: true
        },
        order: [['id_direccion', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: direcciones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las direcciones del cliente',
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva direccion
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createDireccion(req, res) {
    try {
      var { id_cliente,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        municipio,
        estado,
        codigo_postal,
        referencias,
      } = req.body;

      // Validaciones básicas
      const cliente = await Cliente.findByPk(id_cliente);
      if (!cliente) {
        return res.status(400).json({
          success: false,
          message: 'Cliente inexistente'
        });
      }

      if (!calle || calle.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la calle es requerido'
        });
      }
      calle = capitalizeWords(calle);
      
      if (!numero_exterior || numero_exterior.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El número exterior de la casa es requerido'
        });
      }
      
      if (!colonia || colonia.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'La colonia es requerida'
        });
      }
      colonia = capitalizeWords(colonia);
      
      if (!municipio || municipio.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El municipio es requerido'
        });
      }
      municipio = capitalizeWords(municipio);
      
      if (!estado || estado.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El estado es requerido'
        });
      }
      estado = capitalizeWords(estado);
      
      if (!codigo_postal || codigo_postal.trim() === '' || isNaN(codigo_postal)) {
        return res.status(400).json({
          success: false,
          message: 'El código postal es requerido'
        });
      }

      if (await Direccion.findOne({ where: { calle: calle, numero_exterior: numero_exterior, numero_interior: numero_interior, codigo_postal: codigo_postal, id_cliente: id_cliente } })){
        return res.status(400).json({
          success: false,
          message: 'Dirección ya registrada para este cliente'
        });
      }

      const nuevaDireccion = await Direccion.create({
        id_cliente,
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        municipio,
        estado,
        codigo_postal,
        referencias,
      });

      res.status(201).json({
        success: true,
        data: nuevaDireccion,
        message: 'Dirección agregada correctamente'
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la dirección',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un producto existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateDireccion(req, res) {
    try {
      const { id } = req.params;
      const direccion = await Direccion.findByPk(id);

      if (!direccion) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
      }

      // Extraer campos del body
      const {
        calle,
        numero_exterior,
        numero_interior,
        colonia,
        municipio,
        estado,
        codigo_postal,
        referencias,
      } = req.body;

      // Validaciones básicas
      if (calle !== undefined && (calle === null || calle.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'La calle no puede estar vacía'
        });
      }

      if (numero_exterior !== undefined && (numero_exterior === null || numero_exterior.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El número exterior no puede estar vacío'
        });
      }

      if (numero_interior !== undefined && (numero_interior === null || numero_interior.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El número interior no puede estar vacío'
        });
      }
      
      if (colonia !== undefined && (colonia === null || colonia.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'La colonia no puede estar vacía'
        });
      }

      if (municipio !== undefined && (municipio === null || municipio.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El municipio no puede estar vacío'
        });
      }

      if (estado !== undefined && (estado === null || estado.trim() === '')) {
        return res.status(400).json({
          success: false,
          message: 'El estado no puede estar vacío'
        });
      }

      if (codigo_postal !== undefined && isNaN(codigo_postal)) {
        return res.status(400).json({
          success: false,
          message: 'El código postal debe ser un número válido'
        });
      }

      // Preparar objeto de actualización
      const updateData = {};

      if (calle !== undefined) updateData.calle = capitalizeWords(calle);
      if (numero_exterior !== undefined) updateData.numero_exterior = numero_exterior;
      if (numero_interior !== undefined) updateData.numero_interior = numero_interior;
      if (colonia !== undefined) updateData.colonia = capitalizeWords(colonia);
      if (municipio !== undefined) updateData.municipio = capitalizeWords(municipio);
      if (estado !== undefined) updateData.estado = capitalizeWords(estado);

      await direccion.update(updateData);

      res.status(200).json({
        success: true,
        data: direccion,
        message: 'Dirección actualizada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la dirección',
        error: error.message
      });
    }
  }

  /**
   * Elimina un producto
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deleteDireccion(req, res) {
    try {
      const { id } = req.params;
      
      const direccion = await Direccion.findByPk(id);
      
      if (!direccion) {
        return res.status(404).json({
          success: false,
          message: 'Dirección no encontrada'
        });
      }

      await direccion.update({
        activo : false
      });
      
      res.status(200).json({
        success: true,
        message: 'Dirección eliminada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la dirección',
        error: error.message
      });
    }
  }
}

module.exports = DireccionController;