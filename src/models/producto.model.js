const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Producto', {
    id_producto: {
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
    },
    descripcion: {
      type: DataTypes.JSON,
      allowNull: false
    },
    laboratorio: {
      type: DataTypes.TEXT
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    cantidad_real: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    imagen:{
      type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    timestamps: false,
    tableName: 'productos', 
  });
};
