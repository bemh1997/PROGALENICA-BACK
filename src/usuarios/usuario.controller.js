const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
  Representante,
  Medico,
  Cliente,
  Usuario,
  Interno
} = require('../config/database.js');

// Clave secreta para JWT - debe estar en variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_temporal';

class UsuarioController {
  /**
   * Inicia sesión de usuario y genera token JWT
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async loginUsuario(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email
      const usuario = await Usuario.findOne({
        where: { 
          email,
          activo: true
        }
      });

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, usuario.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Obtener información adicional según el tipo de usuario
      let userInfo = {};
      if (usuario.tipo_usuario === 'interno') {
        const interno = await Interno.findOne({
          where: { 
            id_usuario: usuario.id_usuario,
            activo: true
          }
        });
        if (!interno) {
          return res.status(401).json({
            success: false,
            message: 'Usuario interno no encontrado o inactivo'
          });
        }
        userInfo = { rol: interno.rol };
      } else if (usuario.tipo_usuario === 'medico') {
        const medico = await Medico.findOne({
          where: { 
            id_usuario: usuario.id_usuario,
            activo: true
          }
        });
        if (!medico) {
          return res.status(401).json({
            success: false,
            message: 'Médico no encontrado o inactivo'
          });
        }
        userInfo = { id_medico: medico.id_medico };
      } else if (usuario.tipo_usuario === 'representante') {
        const representante = await Representante.findOne({
          where: { 
            id_usuario: usuario.id_usuario,
            activo: true
          }
        });
        if (!representante) {
          return res.status(401).json({
            success: false,
            message: 'Representante no encontrado o inactivo'
          });
        }
        userInfo = { id_representante: representante.id_representante };
      } else if (usuario.tipo_usuario === 'cliente') {
        const cliente = await Cliente.findOne({
          where: { 
            id_usuario: usuario.id_usuario,
            activo: true
          }
        });
        if (!cliente) {
          return res.status(401).json({
            success: false,
            message: 'Cliente no encontrado o inactivo'
          });
        }
        userInfo = { 
          id_cliente: cliente.id_cliente,
          genero: cliente.genero 
        };
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          ...userInfo
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido_paterno: usuario.apellido_paterno,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          ...userInfo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en el inicio de sesión',
        error: error.message
      });
    }
  }

  /**
   * Obtiene todos los clientes
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async getAllUsuarios(req, res) {
    try {
      let usuarios = await Usuario.findAll({
        attributes: [
          'id_usuario',
          'nombre',
          'apellido_paterno',
          'telefono',
          'email',
          'tipo_usuario',
        ],
        order: [['id_usuario', 'ASC']],
        where: { activo: true }
      });
      res.status(200).json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los usuarios',
        error: error.message
      });
    }
  }
  /**
   * Crea un nuevo cliente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async createUsuario(req, res) {
    try {
      let {
        nombre,
        apellido_paterno,
        apellido_materno,
        genero,
        telefono,
        rfc,
        email,
        password,
        tipo_usuario, // ahora obligatorio
        rol // solo para internos
      } = req.body;
      
      // Validaciones de campos obligatorios
      if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
      }
      if (!apellido_paterno || apellido_paterno.trim() === '') {
        return res.status(400).json({ success: false, message: 'El apellido paterno es obligatorio' });
      }
      if (!email || email.trim() === '') {
        return res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio' });
      }

      //Validación de campos únicos
      email = email.toLowerCase();
      if (await Usuario.findOne({ where: { email: email} })){
        return res.status(400).json({
          success: false,
          message: 'Este correo electrónico ya está registrado'
        });
      }

      rfc = rfc.toUpperCase();
      if (await Usuario.findOne({ where: { rfc: rfc} })){
        return res.status(400).json({
          success: false,
          message: 'RFC ya registrado'
        });
      }

      if (await Usuario.findOne({ where: { telefono: telefono} })){
        return res.status(400).json({
          success: false,
          message: 'Teléfono ya registrado'
        });
      }
      
      if (!password || password.trim() === '') {
        return res.status(400).json({ success: false, message: 'La contraseña es obligatoria' });
      }
      if (!tipo_usuario || tipo_usuario.trim() === '') {
        tipo_usuario = 'cliente'; // Asignar valor por defecto
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buscar si el usuario ya existe (por email)
      let usuario = await Usuario.findOne({ where: { email } });
      let result;
      if (usuario) {
        // Reactivar usuario y su modelo correspondiente
        await usuario.update({ activo: true, password: hashedPassword, nombre, apellido_paterno, apellido_materno, telefono, rfc, tipo_usuario });
        if (usuario.tipo_usuario === 'cliente') {
          await Cliente.update({ activo: true }, { where: { id_usuario: usuario.id_usuario } });
        } else if (usuario.tipo_usuario === 'medico') {
          await Medico.update({ activo: true }, { where: { id_usuario: usuario.id_usuario } });
        } else if (usuario.tipo_usuario === 'representante') {
          await Representante.update({ activo: true }, { where: { id_usuario: usuario.id_usuario } });
        } else if (usuario.tipo_usuario === 'interno') {
          await Interno.update({ activo: true }, { where: { id_usuario: usuario.id_usuario } });
        }
        result = usuario;
      } else {
        // Crear usuario base
        usuario = await Usuario.create({
          nombre,
          apellido_paterno,
          apellido_materno,
          telefono,
          rfc,
          email,
          password: hashedPassword,
          tipo_usuario,
          activo: true
        });
        if (tipo_usuario === 'cliente') {
          if (!genero || genero.trim() === '') {
            return res.status(400).json({ success: false, message: 'El género es obligatorio para clientes' });
          }
          const cliente = await Cliente.create({
            id_usuario: usuario.id_usuario,
            genero,
            notas_adminstrativas: '',
            activo: true
          });
          result = await Cliente.findOne({
            where: { id_cliente: cliente.id_cliente },
            attributes: [],
            include: [{
              model: Usuario,
              attributes: [
                'nombre', 'apellido_paterno', 'apellido_materno', 'telefono', 'rfc', 'email'
              ]
            }],
            raw: true,
            nest: true
          });
          result = {
            ...result,
            Usuario: {
              ...result.Usuario,
              genero: cliente.genero
            }
          };
        } else if (tipo_usuario === 'medico') {
          const medico = await Medico.create({
            id_usuario: usuario.id_usuario,
            activo: true
          });
          result = medico;
        } else if (tipo_usuario === 'representante') {
          const representante = await Representante.create({
            id_usuario: usuario.id_usuario,
            activo: true
          });
          result = representante;
        } else if (tipo_usuario === 'interno') {
          if (!rol || !['administrador', 'almacenista', 'ejecutivo'].includes(rol)) {
            return res.status(400).json({ success: false, message: 'El rol es obligatorio y debe ser válido para usuarios internos' });
          }
          const interno = await Interno.create({
            id_usuario: usuario.id_usuario,
            rol,
            activo: true
          });
          result = interno;
        } else {
          return res.status(400).json({ success: false, message: 'Tipo de usuario no soportado' });
        }
      }
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el usuario',
        error: error.message
      });
    }
  }

  /**
   * Actualiza un cliente existente
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async updateUsuario(req, res) {
    try {
      const { id_usuario, tipo_usuario, rol, activo } = req.body;
      const usuario = await Usuario.findByPk(id_usuario);
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }
      // Si el tipo_usuario cambia, mover de tabla y actualizar estado activo
      if (tipo_usuario && tipo_usuario !== usuario.tipo_usuario) {
        // Desactivar en la tabla anterior
        if (usuario.tipo_usuario === 'cliente') {
          await Cliente.update({ activo: false }, { where: { id_usuario } });
        } else if (usuario.tipo_usuario === 'medico') {
          await Medico.update({ activo: false }, { where: { id_usuario } });
        } else if (usuario.tipo_usuario === 'representante') {
          await Representante.update({ activo: false }, { where: { id_usuario } });
        } else if (usuario.tipo_usuario === 'interno') {
          await Interno.update({ activo: false }, { where: { id_usuario } });
        }
        // Activar o crear en la nueva tabla
        if (tipo_usuario === 'cliente') {
          await Cliente.findOrCreate({ where: { id_usuario }, defaults: { activo: true } });
        } else if (tipo_usuario === 'medico') {
          await Medico.findOrCreate({ where: { id_usuario }, defaults: { activo: true } });
        } else if (tipo_usuario === 'representante') {
          await Representante.findOrCreate({ where: { id_usuario }, defaults: { activo: true } });
        } else if (tipo_usuario === 'interno') {
          if (!rol || !['administrador', 'almacenista', 'ejecutivo'].includes(rol)) {
            return res.status(400).json({ success: false, message: 'El rol es obligatorio y debe ser válido para usuarios internos' });
          }
          await Interno.findOrCreate({ where: { id_usuario }, defaults: { rol, activo: true } });
        }
        // Actualizar tipo_usuario en Usuario
        usuario.tipo_usuario = tipo_usuario;
      }
      // Si es interno y se quiere cambiar el rol
      if (usuario.tipo_usuario === 'interno' && rol) {
        if (!['administrador', 'almacenista', 'ejecutivo'].includes(rol)) {
          return res.status(400).json({ success: false, message: 'Rol inválido para usuario interno' });
        }
        await Interno.update({ rol }, { where: { id_usuario } });
      }
      // Actualizar estado activo en la tabla correspondiente
      if (activo !== undefined) {
        if (usuario.tipo_usuario === 'cliente') {
          await Cliente.update({ activo }, { where: { id_usuario } });
        } else if (usuario.tipo_usuario === 'medico') {
          await Medico.update({ activo }, { where: { id_usuario } });
        } else if (usuario.tipo_usuario === 'representante') {
          await Representante.update({ activo }, { where: { id_usuario } });
        } else if (usuario.tipo_usuario === 'interno') {
          await Interno.update({ activo }, { where: { id_usuario } });
        }
        usuario.activo = activo;
      }
      await usuario.save();
      res.status(200).json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar el usuario', error: error.message });
    }
  }

  /**
   * Elimina un cliente por medio de softdelete
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  static async deleteUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      // Softdelete en Usuario
      await usuario.update({ activo: false });
      // Softdelete en el modelo correspondiente
      if (usuario.tipo_usuario === 'cliente') {
        await Cliente.update({ activo: false }, { where: { id_usuario: id } });
      } else if (usuario.tipo_usuario === 'medico') {
        await Medico.update({ activo: false }, { where: { id_usuario: id } });
      } else if (usuario.tipo_usuario === 'representante') {
        await Representante.update({ activo: false }, { where: { id_usuario: id } });
      } else if (usuario.tipo_usuario === 'interno') {
        await Interno.update({ activo: false }, { where: { id_usuario: id } });
      }
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el usuario',
        error: error.message
      });
    }
  }
}

module.exports = UsuarioController;