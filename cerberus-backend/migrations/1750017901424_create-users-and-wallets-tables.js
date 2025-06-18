// db/migrations/<timestamp>_create_users_and_wallets_tables.mjs

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 * This JSDoc comment is a best practice that enables editor type hints and
 * autocompletion for the `pgm` (MigrationBuilder) methods.
 */
export const shorthands = undefined;

/**
 * The 'up' migration. This function creates the foundational 'users' and 'wallets' tables,
 * enforcing data integrity with constraints and ensuring high performance with indexing
 * right from the start.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm - The migration builder object used to construct SQL queries.
 */
export async function up(pgm) {
  console.log('Applying migration: create_users_and_wallets_tables...');

  // --- Enable Required PostgreSQL Extensions ---
  // Enable the 'pgcrypto' extension to use gen_random_uuid() for primary keys.
  // This is the modern standard for generating secure, non-sequential unique identifiers.
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  // --- USERS TABLE ---
  // This table stores the core user account information.
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'), // Modern, collision-resistant primary keys.
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
      check: 'email = lower(email)', // DB-level constraint to ensure email uniqueness is case-insensitive.
    },
    password_hash: {
      type: 'text', // Using 'text' is flexible for any future hashing algorithm changes (e.g., Argon2id).
      notNull: true,
    },
    preferred_currency: {
      type: 'varchar(10)',
      notNull: true,
      default: 'USD',
    },
    created_at: {
      type: 'timestamptz', // 'timestamptz' is shorthand for 'timestamp with time zone', the best practice for storing UTC time.
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
  console.log('>> "users" table created.');

  // --- WALLETS TABLE ---
  // This table links multiple blockchain addresses to a single user account.
  pgm.createTable('wallets', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"(id)', // Establishes a foreign key relationship with the users table.
      onDelete: 'CASCADE', // CRITICAL: Ensures that if a user is deleted, all their associated wallets are automatically deleted, preventing orphaned data.
    },
    chain_id: {
      type: 'varchar(50)', // E.g., 'ethereum', 'solana'.
      notNull: true,
    },
    address: {
      type: 'varchar(255)', // The public blockchain wallet address.
      notNull: true,
    },
    nickname: {
      type: 'varchar(100)', // An optional, user-assigned name for the wallet.
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'), // A thoughtful addition. Useful if features like editing a nickname are added later.
    },
  });
  console.log('>> "wallets" table created.');

  // --- Constraints & Indexes ---
  // Define rules that span multiple columns for data integrity and performance.

  // This composite UNIQUE constraint is a business rule enforced by the database.
  // It prevents a user from adding the exact same address on the same chain more than once.
  pgm.addConstraint('wallets', 'wallets_user_id_chain_id_address_key', {
    unique: ['user_id', 'chain_id', 'address'],
  });
  console.log('>> Unique constraint on wallets(user_id, chain_id, address) added.');

  // This B-Tree index is the most critical performance optimization in our schema.
  // It makes fetching all wallets for a specific user (`WHERE user_id = ...`) extremely fast.
  pgm.createIndex('wallets', 'user_id');
  console.log('>> Index on wallets(user_id) created.');
}

/**
 * The 'down' migration. This function safely reverses every change made in the up() migration.
 * This capability is essential for safe rollbacks in development and production if a problem is discovered.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm - The migration builder.
 */
export async function down(pgm) {
  console.log('Reverting migration: create_users_and_wallets_tables...');

  // Operations must be performed in the reverse order of dependency.
  // We drop 'wallets' first because it depends on 'users'.
  pgm.dropTable('wallets');
  console.log('>> "wallets" table dropped.');

  pgm.dropTable('users');
  console.log('>> "users" table dropped.');

  // Note: We intentionally do NOT drop the 'pgcrypto' extension here.
  // It's considered a shared resource, and other migrations might depend on it.
  // Dropping it could break other parts of the database schema.
}