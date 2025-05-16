const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Producto', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codigo_barras: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    precio_unitario: {
      type: DataTypes.NUMERIC,
      allowNull: false
    },
    cantidad_real: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'productos', 
  });
};
