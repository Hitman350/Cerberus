// db/migrations/<timestamp>_create_users_and_wallets_tables.mjs

// This JSDoc comment is for type-checking and editor autocompletion. It's a best practice.
/** @type {import('node-pg-migrate').ColumnDefinitions | undefined} */
export const shorthands = undefined;

/**
 * The 'up' migration function.
 * This function is executed when you run `npm run migrate up`.
 * It should contain all the logic for creating tables, columns, indexes, etc.
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export async function up(pgm) {
  console.log('Applying migration: create_users_and_wallets_tables...');

  // Enable the 'pgcrypto' extension to use gen_random_uuid() for primary keys.
  // Using { ifNotExists: true } makes this script safe to re-run.
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  // --- 1. Create the 'users' table ---
  // This table will store the core user account information.
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
      // Enforce lowercase emails at the database level for consistency.
      check: 'email = lower(email)',
    },
    password_hash: {
      type: 'text', // Use 'text' for flexibility with different hash lengths.
      notNull: true,
    },
    preferred_currency: {
      type: 'varchar(10)',
      notNull: true,
      default: 'USD',
    },
    created_at: {
      type: 'timestamp with time zone', // Use TIMESTAMPTZ for unambiguous time storage.
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  console.log('>> "users" table created.');

  // --- 2. Create the 'wallets' table ---
  // This table links multiple blockchain addresses to a single user.
  pgm.createTable('wallets', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)', // The quotes are important for table names.
      onDelete: 'CASCADE', // CRITICAL: If a user is deleted, their wallets are automatically deleted too.
    },
    chain_id: {
      type: 'varchar(50)',
      notNull: true,
    },
    address: {
      type: 'varchar(255)',
      notNull: true,
    },
    nickname: {
      type: 'varchar(100)', // Optional, so no `notNull` constraint.
    },
    created_at: {
      type: 'timestamp with time zone',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  console.log('>> "wallets" table created.');

  // --- 3. Add a composite unique constraint ---
  // This prevents a user from adding the same wallet address on the same chain more than once.
  pgm.addConstraint('wallets', 'wallets_user_id_chain_id_address_key', {
    unique: ['user_id', 'chain_id', 'address'],
  });

  console.log('>> Unique constraint on "wallets" table added.');
}

/**
 * The 'down' migration function.
 * This function is executed when you run `npm run migrate down`.
 * It must perfectly reverse the changes made in the 'up' function.
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export async function down(pgm) {
  console.log('Reverting migration: create_users_and_wallets_tables...');

  // The order of operations in 'down' must be the reverse of 'up'.
  // We drop the constraint first (though dropTable does this implicitly).
  // Then we drop the tables in reverse order of creation.
  pgm.dropTable('wallets');
  console.log('>> "wallets" table dropped.');

  pgm.dropTable('users');
  console.log('>> "users" table dropped.');

  // We typically do not drop extensions in a 'down' migration,
  // as other parts of the database might still be using them.
}