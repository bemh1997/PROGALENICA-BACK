const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Direccion', {
    id_direccion: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id_cliente: {
      type: DataTypes.BIGINT
    },
    calle:{
      type: DataTypes.TEXT,
      allowNull: false
    },
    numero_exterior: DataTypes.TEXT,
    numero_interior: DataTypes.TEXT,
    colonia: DataTypes.TEXT,
    municipio: DataTypes.TEXT,
    estado: DataTypes.TEXT,
    codigo_postal: DataTypes.TEXT,
    referencias: DataTypes.TEXT,
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'direcciones',
    timestamps: false
  });
};