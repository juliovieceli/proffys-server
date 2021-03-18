import knex from 'knex'
import Knex from 'knex';

export async function up(knex: Knex) {
   return knex.schema.createTable('connections', table => {
      table.increments('id').primary();
      table.integer('userId')
         .notNullable()
         .references('id')
         .inTable('users')
         .onDelete('CASCADE')
         .onUpdate('CASCADE');
      table.timestamp('createAt')
         .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
         .notNullable();
   })
}

export async function down(knex: Knex) {
   return knex.schema.dropTable('connections')
}