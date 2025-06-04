const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Representante', {
    id_representante: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: false
    },
    activo: DataTypes.BOOLEAN
  }, {
    tableName: 'representantes',
    timestamps: false
  });
};
