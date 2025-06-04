const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Paqueteria', {
    id_paqueteria: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'paqueterias',
    timestamps: false
  });
};
