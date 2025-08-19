const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Usuario', {
<<<<<<< HEAD
  id_usuario: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  apellido_paterno: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  apellido_materno: DataTypes.TEXT,
  telefono: DataTypes.TEXT,
  rfc: DataTypes.TEXT,
  email: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo_usuario: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  activo: DataTypes.BOOLEAN
}, {
  tableName: 'usuarios',
  timestamps: false
})
=======
    id_usuario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    apellido_paterno: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    apellido_materno: DataTypes.TEXT,
    telefono: DataTypes.TEXT,
    rfc: DataTypes.TEXT,
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo_usuario: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    activo: DataTypes.BOOLEAN
  }, {
    tableName: 'usuarios',
    timestamps: false
  })
>>>>>>> 07692d79ca40fb35ff87ac88569c3bf3ddc4198d
};