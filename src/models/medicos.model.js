const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Medico', {
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
    cedula: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    especialidad: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'medicos', 
  });
};
