const dotenv = require('dotenv');
dotenv.config();
const { Paqueteria } = require('../config/database.js');
class PaqueteriaController {
  /**
   * Obtiene todas las paqueterías
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllPaqueterias(req, res) {
    try {
    
      // Verifica que el modelo está disponible
      if (!Paqueteria) {
        console.error('El modelo Paqueteria no está disponible');
        return res.status(500).json({
          success: false,
          message: 'Error: Modelo de Paqueteria no disponible'
        });
      }
      
      const paqueterias = await Paqueteria.findAll({
        order: [['nombre', 'ASC']]
      });
      
      console.log(`Paqueterías encontradas: ${paqueterias.length}`);
      
      res.status(200).json({
        success: true,
        data: paqueterias,
        count: paqueterias.length
      });
    } catch (error) {
      console.error('Error al obtener paqueterías:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las paqueterías',
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }

  /**
   * Obtiene una paquetería por su ID
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getPaqueteriaById(req, res) {
    try {
      const { id } = req.params;
      console.log(`Buscando paquetería con ID: ${id}`);
      
      if (!Paqueteria) {
        console.error('El modelo Paqueteria no está disponible');
        return res.status(500).json({
          success: false,
          message: 'Error: Modelo de Paqueteria no disponible'
        });
      }
      
      const paqueteria = await Paqueteria.findByPk(id);
      
      if (!paqueteria) {
        console.log(`Paquetería con ID ${id} no encontrada`);
        return res.status(404).json({
          success: false,
          message: 'Paquetería no encontrada'
        });
      }
      
      console.log('Paquetería encontrada:', paqueteria.nombre);
      
      res.status(200).json({
        success: true,
        data: paqueteria
      });
    } catch (error) {
      console.error(`Error al obtener paquetería con ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la paquetería',
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }

  /**
   * Crea una nueva paquetería
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createPaqueteria(req, res) {
    try {
      const { nombre } = req.body;
      console.log(`Intentando crear paquetería con nombre: ${nombre}`);
      
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la paquetería es requerido'
        });
      }
      
      if (!Paqueteria) {
        console.error('El modelo Paqueteria no está disponible');
        return res.status(500).json({
          success: false,
          message: 'Error: Modelo de Paqueteria no disponible'
        });
      }
      
      // Descomentado: Este es el código que estaba comentado antes
      const nuevaPaqueteria = await Paqueteria.create({
        nombre
      });
      
      console.log(`Paquetería creada con ID: ${nuevaPaqueteria.id}`);
      
      res.status(201).json({
        success: true,
        data: nuevaPaqueteria,
        message: 'Paquetería creada correctamente'
      });
    } catch (error) {
      console.error('Error al crear paquetería:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la paquetería',
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }

  /**
   * Actualiza una paquetería existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updatePaqueteria(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      
      console.log(`Intentando actualizar paquetería con ID: ${id}, nuevo nombre: ${nombre}`);
      
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la paquetería es requerido'
        });
      }
      
      if (!Paqueteria) {
        console.error('El modelo Paqueteria no está disponible');
        return res.status(500).json({
          success: false,
          message: 'Error: Modelo de Paqueteria no disponible'
        });
      }
      
      const paqueteria = await Paqueteria.findByPk(id);
      
      if (!paqueteria) {
        console.log(`Paquetería con ID ${id} no encontrada para actualizar`);
        return res.status(404).json({
          success: false,
          message: 'Paquetería no encontrada'
        });
      }
      
      await paqueteria.update({ nombre });
      
      console.log(`Paquetería con ID ${id} actualizada correctamente`);
      
      res.status(200).json({
        success: true,
        data: paqueteria,
        message: 'Paquetería actualizada correctamente'
      });
    } catch (error) {
      console.error(`Error al actualizar paquetería con ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la paquetería',
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }

  /**
   * Elimina una paquetería
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deletePaqueteria(req, res) {
    try {
      const { id } = req.params;
      console.log(`Intentando eliminar paquetería con ID: ${id}`);
      
      if (!Paqueteria) {
        console.error('El modelo Paqueteria no está disponible');
        return res.status(500).json({
          success: false,
          message: 'Error: Modelo de Paqueteria no disponible'
        });
      }
      
      const paqueteria = await Paqueteria.findByPk(id);
      
      if (!paqueteria) {
        console.log(`Paquetería con ID ${id} no encontrada para eliminar`);
        return res.status(404).json({
          success: false,
          message: 'Paquetería no encontrada'
        });
      }
      
      await paqueteria.destroy();
      
      console.log(`Paquetería con ID ${id} eliminada correctamente`);
      
      res.status(200).json({
        success: true,
        message: 'Paquetería eliminada correctamente'
      });
    } catch (error) {
      console.error(`Error al eliminar paquetería con ID ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la paquetería',
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }
}

module.exports = PaqueteriaController;