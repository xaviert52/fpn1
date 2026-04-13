exports.up = async function up(knex) {
  const hasTable = await knex.schema.hasTable('invite_validations');
  if (!hasTable) return;

  const hasInviteToken = await knex.schema.hasColumn('invite_validations', 'invite_token');
  if (!hasInviteToken) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.text('invite_token');
    });
  }

  const hasRole = await knex.schema.hasColumn('invite_validations', 'role');
  if (!hasRole) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.string('role', 80);
    });
  }

  const hasUpstreamUrl = await knex.schema.hasColumn('invite_validations', 'upstream_invite_url');
  if (!hasUpstreamUrl) {
    await knex.schema.alterTable('invite_validations', (table) => {
      table.text('upstream_invite_url');
    });
  }
};

exports.down = async function down(knex) {
  const hasTable = await knex.schema.hasTable('invite_validations');
  if (!hasTable) return;

  const hasInviteToken = await knex.schema.hasColumn('invite_validations', 'invite_token');
  const hasRole = await knex.schema.hasColumn('invite_validations', 'role');
  const hasUpstreamUrl = await knex.schema.hasColumn('invite_validations', 'upstream_invite_url');

  await knex.schema.alterTable('invite_validations', (table) => {
    if (hasInviteToken) table.dropColumn('invite_token');
    if (hasRole) table.dropColumn('role');
    if (hasUpstreamUrl) table.dropColumn('upstream_invite_url');
  });
};
