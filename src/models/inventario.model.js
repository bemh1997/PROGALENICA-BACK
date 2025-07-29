const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Inventario', {
    id_inventario: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_producto: {
      type: DataTypes.UUID,
      references: {
        model: 'productos',
        key: 'id_producto'
      }
    },
    numero_lote:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_caducidad:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    cantidad_disponible:{
      type: DataTypes.INTEGER,
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
    ubicacion_almacen:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    costo_unitario:{
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    iva_aplicable:{
      type: DataTypes.DECIMAL,
      allowNull: false
    },
  }, {
    tableName: 'inventario',
    timestamps: false
  });
};
