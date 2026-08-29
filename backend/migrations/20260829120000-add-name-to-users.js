"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("users");

    if (!table.name) {
      await queryInterface.addColumn("users", "name", {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "User",
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("users");

    if (table.name) {
      await queryInterface.removeColumn("users", "name");
    }
  },
};
