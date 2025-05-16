const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Cliente', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    telefono: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    codigo_postal: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    calle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    numero_exterior: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    numero_interior: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    colonia: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    municipio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    genero: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: false,
    tableName: 'clientes', 
  });
};
