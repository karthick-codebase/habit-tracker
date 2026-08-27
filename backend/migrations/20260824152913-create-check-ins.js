"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("check_ins", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      habitId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "habits",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      checkedInAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      localDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addConstraint("check_ins", {
      fields: ["habitId", "localDate"],
      type: "unique",
      name: "unique_habit_local_date",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("check_ins");
  },
};