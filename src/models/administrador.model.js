const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Administrador', {
    id_administrador: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: false
    },
    rol: {
      type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'administradores',
    timestamps: false
  });
};