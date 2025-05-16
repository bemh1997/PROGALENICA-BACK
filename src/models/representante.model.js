const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Representante', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    telefono: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correo: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'representantes', 
  });
};
