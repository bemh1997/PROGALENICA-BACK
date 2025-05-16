const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Administrador', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    telefono: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rol: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: false,
    tableName: 'administrador', 
  });
};
