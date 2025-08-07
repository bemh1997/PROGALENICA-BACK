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
    codigo_sat: {
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
      type: DataTypes.TEXT,
      allowNull: false
    },
    presentacion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    concentracion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    via_administracion: {
      type: DataTypes.TEXT,
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
      // allowNull: false
      defaultValue: 0,
    },
    costo_unitario:{
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    iva_aplicable:{
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    stock_minimo:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock_maximo:{
      type: DataTypes.INTEGER,
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
    timestamps: true,
    tableName: 'productos', 
  });
};
