// @ts-nocheck
'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserTokenSchema extends Schema {
  up () {
    this.create('user_tokens', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id')
        .inTable('users').onUpdate('CASCADE').onDelete('CASCADE')
      table.string('token').unique()
      table.string('session_id').unique()
      table.integer('hour').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('user_tokens')
  }
}

module.exports = UserTokenSchema
