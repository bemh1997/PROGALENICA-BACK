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
    clave_sat:{
      type: DataTypes.TEXT
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
