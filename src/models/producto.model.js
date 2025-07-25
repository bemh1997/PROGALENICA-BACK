const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Producto', {
    id_producto: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codigo_barras: {
      type: DataTypes.TEXT,
    },
    ficha_tecnica:{
      type: DataTypes.TEXT
    },
    principio_activo:{
      type: DataTypes.TEXT
    },
    clasificacion:{
      type: DataTypes.TEXT
    },
    temperatura_conservacion:{
      type: DataTypes.TEXT
    },
    receta_medica:{
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    descripcion: {
      type: DataTypes.JSON,
      allowNull: false
    },
    id_laboratorio: {
      type: DataTypes.UUID,
      references: {
        model: 'laboratorios',
        key: 'id_laboratorio'
      }
    },
    precio_venta: {
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
