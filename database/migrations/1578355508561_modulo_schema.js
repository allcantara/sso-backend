// @ts-nocheck
'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ModuloSchema extends Schema {
  up () {
    this.create('modulos', (table) => {
      table.increments()
      table.integer('user_id')
      table.string('name').notNullable()
      table.string('url').notNullable().unique()
      table.string('module_secret').notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('modulos')
  }
}

module.exports = ModuloSchema
