// @ts-nocheck
'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EntidadeSchema extends Schema {
  up () {
    this.create('entidades', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('entidades')
  }
}

module.exports = EntidadeSchema
