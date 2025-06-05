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
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    laboratorio: {
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
