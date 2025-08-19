const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Medico', {
    id_medico: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    id_usuario: {
      type: DataTypes.UUID,
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
