const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Detallespedido', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    cantidad: {
      type: DataTypes.BIGINT
    },
    total: {
      type: DataTypes.NUMERIC
    },
    factura: {
      type: DataTypes.TEXT,
      unique: true
    }
  }, {
    timestamps: false,
    tableName: 'detallespedido', 
  });
};
