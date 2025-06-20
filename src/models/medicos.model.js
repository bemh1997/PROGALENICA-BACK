const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Medico', {
    id_medico: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: false
    },
    cedula: {
      type: DataTypes.TEXT
    },
    especialidad: {
      type: DataTypes.TEXT
    },
    activo: {
      type: DataTypes.BOOLEAN
    }
  }, {
    tableName: 'medicos',
    timestamps: false
  });
};
