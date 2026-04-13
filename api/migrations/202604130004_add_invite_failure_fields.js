exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable('invite_validations');
  if (!hasTable) return;

  const hasFailureReason = await knex.schema.hasColumn('invite_validations', 'failure_reason_es');
  if (!hasFailureReason) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.text('failure_reason_es');
    });
  }

  const hasFailedAt = await knex.schema.hasColumn('invite_validations', 'failed_at');
  if (!hasFailedAt) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.timestamp('failed_at');
    });
  }

  const hasFailureOrigin = await knex.schema.hasColumn('invite_validations', 'failure_origin');
  if (!hasFailureOrigin) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.string('failure_origin', 40);
    });
  }
};

exports.down = async function down(knex) {
  const hasTable = await knex.schema.hasTable('invite_validations');
  if (!hasTable) return;

  const hasFailureReason = await knex.schema.hasColumn('invite_validations', 'failure_reason_es');
  const hasFailedAt = await knex.schema.hasColumn('invite_validations', 'failed_at');
  const hasFailureOrigin = await knex.schema.hasColumn('invite_validations', 'failure_origin');

  await knex.schema.alterTable('invite_validations', (table) => {
    if (hasFailureReason) table.dropColumn('failure_reason_es');
    if (hasFailedAt) table.dropColumn('failed_at');
    if (hasFailureOrigin) table.dropColumn('failure_origin');
  });
};
