exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable('invite_validations');
  if (!hasTable) return;

  const hasNotifyStatus = await knex.schema.hasColumn('invite_validations', 'notify_status');
  if (!hasNotifyStatus) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.string('notify_status', 20).notNullable().defaultTo('PENDING');
    });
  }

  const hasNotifyHttpStatus = await knex.schema.hasColumn('invite_validations', 'notify_http_status');
  if (!hasNotifyHttpStatus) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.integer('notify_http_status');
    });
  }

  const hasNotifyResponse = await knex.schema.hasColumn('invite_validations', 'notify_response');
  if (!hasNotifyResponse) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.text('notify_response');
    });
  }

  const hasNotifyError = await knex.schema.hasColumn('invite_validations', 'notify_error');
  if (!hasNotifyError) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.text('notify_error');
    });
  }

  const hasNotifiedAt = await knex.schema.hasColumn('invite_validations', 'notified_at');
  if (!hasNotifiedAt) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.timestamp('notified_at');
    });
  }
};

exports.down = async function down(knex) {
  const hasTable = await knex.schema.hasTable('invite_validations');
  if (!hasTable) return;

  const hasNotifyStatus = await knex.schema.hasColumn('invite_validations', 'notify_status');
  const hasNotifyHttpStatus = await knex.schema.hasColumn('invite_validations', 'notify_http_status');
  const hasNotifyResponse = await knex.schema.hasColumn('invite_validations', 'notify_response');
  const hasNotifyError = await knex.schema.hasColumn('invite_validations', 'notify_error');
  const hasNotifiedAt = await knex.schema.hasColumn('invite_validations', 'notified_at');

  await knex.schema.alterTable('invite_validations', (table) => {
    if (hasNotifyStatus) table.dropColumn('notify_status');
    if (hasNotifyHttpStatus) table.dropColumn('notify_http_status');
    if (hasNotifyResponse) table.dropColumn('notify_response');
    if (hasNotifyError) table.dropColumn('notify_error');
    if (hasNotifiedAt) table.dropColumn('notified_at');
  });
};
