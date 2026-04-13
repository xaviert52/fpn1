exports.up = async function up(knex) {
  const hasInvites = await knex.schema.hasTable('invite_validations');
  if (!hasInvites) {
    await knex.schema.createTable('invite_validations', (table) => {
      table.uuid('id').primary();
      table.string('local_invite_id', 100).notNullable().unique();
      table.string('email', 255).notNullable();
      table.text('verification_url').notNullable();
      table.string('status', 30).notNullable().defaultTo('PENDING');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.string('kratos_identity_id', 100).notNullable().unique();
      table.string('email', 255).notNullable().unique();
      table.string('first_name', 150).notNullable();
      table.string('last_name', 150).notNullable();
      table.string('dni', 20).notNullable().unique();
      table.string('telefono', 20).notNullable();
      table.string('invite_local_id', 100);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('invite_validations');
};
