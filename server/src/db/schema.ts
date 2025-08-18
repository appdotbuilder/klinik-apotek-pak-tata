import { serial, text, pgTable, timestamp, numeric, integer, date, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'dokter', 'kasir']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull(),
});

// Patients table
export const patientsTable = pgTable('patients', {
  id: serial('id').primaryKey(),
  nama: text('nama').notNull(),
  alamat: text('alamat').notNull(),
  no_telp: text('no_telp').notNull(),
  tanggal_lahir: date('tanggal_lahir').notNull(),
  riwayat_penyakit: text('riwayat_penyakit'),
});

// Suppliers table
export const suppliersTable = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  nama_supplier: text('nama_supplier').notNull(),
  alamat: text('alamat').notNull(),
  no_telp: text('no_telp').notNull(),
  kontak_person: text('kontak_person').notNull(),
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  nama_produk: text('nama_produk').notNull(),
  kategori: text('kategori').notNull(),
  satuan: text('satuan').notNull(),
  stok: integer('stok').notNull().default(0),
  harga_beli: numeric('harga_beli', { precision: 10, scale: 2 }).notNull(),
  harga_jual: numeric('harga_jual', { precision: 10, scale: 2 }).notNull(),
  keterangan: text('keterangan'),
});

// Medical records table
export const medicalRecordsTable = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  patient_id: integer('patient_id').notNull().references(() => patientsTable.id),
  dokter_id: integer('dokter_id').notNull().references(() => usersTable.id),
  keluhan: text('keluhan').notNull(),
  diagnosa: text('diagnosa').notNull(),
  tindakan: text('tindakan').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Prescriptions table
export const prescriptionsTable = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  medical_record_id: integer('medical_record_id').notNull().references(() => medicalRecordsTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  qty: integer('qty').notNull(),
});

// Sales transactions table
export const salesTransactionsTable = pgTable('sales_transactions', {
  id: serial('id').primaryKey(),
  kasir_id: integer('kasir_id').notNull().references(() => usersTable.id),
  patient_id: integer('patient_id').references(() => patientsTable.id),
  tanggal: date('tanggal').defaultNow().notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  bayar: numeric('bayar', { precision: 10, scale: 2 }).notNull(),
  kembalian: numeric('kembalian', { precision: 10, scale: 2 }).notNull(),
});

// Sales transaction items table
export const salesTransactionItemsTable = pgTable('sales_transaction_items', {
  id: serial('id').primaryKey(),
  sales_transaction_id: integer('sales_transaction_id').notNull().references(() => salesTransactionsTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  qty: integer('qty').notNull(),
  harga: numeric('harga', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Purchase transactions table
export const purchaseTransactionsTable = pgTable('purchase_transactions', {
  id: serial('id').primaryKey(),
  supplier_id: integer('supplier_id').notNull().references(() => suppliersTable.id),
  kasir_id: integer('kasir_id').notNull().references(() => usersTable.id),
  tanggal: date('tanggal').defaultNow().notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
});

// Purchase transaction items table
export const purchaseTransactionItemsTable = pgTable('purchase_transaction_items', {
  id: serial('id').primaryKey(),
  purchase_transaction_id: integer('purchase_transaction_id').notNull().references(() => purchaseTransactionsTable.id),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  qty: integer('qty').notNull(),
  harga: numeric('harga', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  medicalRecords: many(medicalRecordsTable),
  salesTransactions: many(salesTransactionsTable),
  purchaseTransactions: many(purchaseTransactionsTable),
}));

export const patientsRelations = relations(patientsTable, ({ many }) => ({
  medicalRecords: many(medicalRecordsTable),
  salesTransactions: many(salesTransactionsTable),
}));

export const suppliersRelations = relations(suppliersTable, ({ many }) => ({
  purchaseTransactions: many(purchaseTransactionsTable),
}));

export const productsRelations = relations(productsTable, ({ many }) => ({
  prescriptions: many(prescriptionsTable),
  salesTransactionItems: many(salesTransactionItemsTable),
  purchaseTransactionItems: many(purchaseTransactionItemsTable),
}));

export const medicalRecordsRelations = relations(medicalRecordsTable, ({ one, many }) => ({
  patient: one(patientsTable, {
    fields: [medicalRecordsTable.patient_id],
    references: [patientsTable.id],
  }),
  dokter: one(usersTable, {
    fields: [medicalRecordsTable.dokter_id],
    references: [usersTable.id],
  }),
  prescriptions: many(prescriptionsTable),
}));

export const prescriptionsRelations = relations(prescriptionsTable, ({ one }) => ({
  medicalRecord: one(medicalRecordsTable, {
    fields: [prescriptionsTable.medical_record_id],
    references: [medicalRecordsTable.id],
  }),
  product: one(productsTable, {
    fields: [prescriptionsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const salesTransactionsRelations = relations(salesTransactionsTable, ({ one, many }) => ({
  kasir: one(usersTable, {
    fields: [salesTransactionsTable.kasir_id],
    references: [usersTable.id],
  }),
  patient: one(patientsTable, {
    fields: [salesTransactionsTable.patient_id],
    references: [patientsTable.id],
  }),
  items: many(salesTransactionItemsTable),
}));

export const salesTransactionItemsRelations = relations(salesTransactionItemsTable, ({ one }) => ({
  salesTransaction: one(salesTransactionsTable, {
    fields: [salesTransactionItemsTable.sales_transaction_id],
    references: [salesTransactionsTable.id],
  }),
  product: one(productsTable, {
    fields: [salesTransactionItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const purchaseTransactionsRelations = relations(purchaseTransactionsTable, ({ one, many }) => ({
  supplier: one(suppliersTable, {
    fields: [purchaseTransactionsTable.supplier_id],
    references: [suppliersTable.id],
  }),
  kasir: one(usersTable, {
    fields: [purchaseTransactionsTable.kasir_id],
    references: [usersTable.id],
  }),
  items: many(purchaseTransactionItemsTable),
}));

export const purchaseTransactionItemsRelations = relations(purchaseTransactionItemsTable, ({ one }) => ({
  purchaseTransaction: one(purchaseTransactionsTable, {
    fields: [purchaseTransactionItemsTable.purchase_transaction_id],
    references: [purchaseTransactionsTable.id],
  }),
  product: one(productsTable, {
    fields: [purchaseTransactionItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  patients: patientsTable,
  suppliers: suppliersTable,
  products: productsTable,
  medicalRecords: medicalRecordsTable,
  prescriptions: prescriptionsTable,
  salesTransactions: salesTransactionsTable,
  salesTransactionItems: salesTransactionItemsTable,
  purchaseTransactions: purchaseTransactionsTable,
  purchaseTransactionItems: purchaseTransactionItemsTable,
};