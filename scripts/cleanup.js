const { query } = require('../auth/db');

async function cleanup() {
  const now = Math.floor(Date.now() / 1000);
  const ninetyDays = 90 * 24 * 60 * 60;
  const cutoff = now - ninetyDays;

  console.log('Cleaning expired sessions and old audit logs...');
  await query('DELETE FROM sessions WHERE expires_at < ?', [now]);
  await query('DELETE FROM audit_log WHERE timestamp < ?', [cutoff]);
  console.log('Cleanup complete');
}

cleanup().catch((e) => {
  console.error('Cleanup failed', e);
  process.exit(1);
});
