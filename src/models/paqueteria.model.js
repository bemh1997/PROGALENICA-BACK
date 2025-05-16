const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Paqueteria', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'paqueterias', 
  });
};
