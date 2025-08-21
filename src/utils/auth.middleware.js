const jwt = require('jsonwebtoken');
const { Usuario, Interno } = require('../config/database.js');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_temporal';

// Middleware para verificar el token JWT
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findOne({
      where: {
        id_usuario: decoded.id_usuario,
        activo: true
      }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar si el usuario es administrador
const isAdmin = async (req, res, next) => {
  try {
    if (!req.usuario || req.usuario.tipo_usuario !== 'interno') {
      return res.status(403).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    const interno = await Interno.findOne({
      where: {
        id_usuario: req.usuario.id_usuario,
        rol: 'administrador',
        activo: true
      }
    });

    if (!interno) {
      return res.status(403).json({
        success: false,
        message: 'Acceso no autorizado'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos',
      error: error.message
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
