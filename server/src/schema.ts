import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'dokter', 'kasir']);
export type UserRole = z.infer<typeof userRoleSchema>;

// User schemas
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: userRoleSchema,
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleSchema,
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: userRoleSchema.optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Patient schemas
export const patientSchema = z.object({
  id: z.number(),
  nama: z.string(),
  alamat: z.string(),
  no_telp: z.string(),
  tanggal_lahir: z.coerce.date(),
  riwayat_penyakit: z.string().nullable(),
});

export type Patient = z.infer<typeof patientSchema>;

export const createPatientInputSchema = z.object({
  nama: z.string().min(1),
  alamat: z.string().min(1),
  no_telp: z.string().min(1),
  tanggal_lahir: z.coerce.date(),
  riwayat_penyakit: z.string().nullable(),
});

export type CreatePatientInput = z.infer<typeof createPatientInputSchema>;

export const updatePatientInputSchema = z.object({
  id: z.number(),
  nama: z.string().min(1).optional(),
  alamat: z.string().min(1).optional(),
  no_telp: z.string().min(1).optional(),
  tanggal_lahir: z.coerce.date().optional(),
  riwayat_penyakit: z.string().nullable().optional(),
});

export type UpdatePatientInput = z.infer<typeof updatePatientInputSchema>;

// Supplier schemas
export const supplierSchema = z.object({
  id: z.number(),
  nama_supplier: z.string(),
  alamat: z.string(),
  no_telp: z.string(),
  kontak_person: z.string(),
});

export type Supplier = z.infer<typeof supplierSchema>;

export const createSupplierInputSchema = z.object({
  nama_supplier: z.string().min(1),
  alamat: z.string().min(1),
  no_telp: z.string().min(1),
  kontak_person: z.string().min(1),
});

export type CreateSupplierInput = z.infer<typeof createSupplierInputSchema>;

export const updateSupplierInputSchema = z.object({
  id: z.number(),
  nama_supplier: z.string().min(1).optional(),
  alamat: z.string().min(1).optional(),
  no_telp: z.string().min(1).optional(),
  kontak_person: z.string().min(1).optional(),
});

export type UpdateSupplierInput = z.infer<typeof updateSupplierInputSchema>;

// Product schemas
export const productSchema = z.object({
  id: z.number(),
  nama_produk: z.string(),
  kategori: z.string(),
  satuan: z.string(),
  stok: z.number().int(),
  harga_beli: z.number(),
  harga_jual: z.number(),
  keterangan: z.string().nullable(),
});

export type Product = z.infer<typeof productSchema>;

export const createProductInputSchema = z.object({
  nama_produk: z.string().min(1),
  kategori: z.string().min(1),
  satuan: z.string().min(1),
  stok: z.number().int().nonnegative().default(0),
  harga_beli: z.number().positive(),
  harga_jual: z.number().positive(),
  keterangan: z.string().nullable(),
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = z.object({
  id: z.number(),
  nama_produk: z.string().min(1).optional(),
  kategori: z.string().min(1).optional(),
  satuan: z.string().min(1).optional(),
  stok: z.number().int().nonnegative().optional(),
  harga_beli: z.number().positive().optional(),
  harga_jual: z.number().positive().optional(),
  keterangan: z.string().nullable().optional(),
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Medical record schemas
export const medicalRecordSchema = z.object({
  id: z.number(),
  patient_id: z.number(),
  dokter_id: z.number(),
  keluhan: z.string(),
  diagnosa: z.string(),
  tindakan: z.string(),
  created_at: z.coerce.date(),
});

export type MedicalRecord = z.infer<typeof medicalRecordSchema>;

export const createMedicalRecordInputSchema = z.object({
  patient_id: z.number(),
  dokter_id: z.number(),
  keluhan: z.string().min(1),
  diagnosa: z.string().min(1),
  tindakan: z.string().min(1),
});

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordInputSchema>;

// Prescription schemas
export const prescriptionSchema = z.object({
  id: z.number(),
  medical_record_id: z.number(),
  product_id: z.number(),
  qty: z.number().int().positive(),
});

export type Prescription = z.infer<typeof prescriptionSchema>;

export const createPrescriptionInputSchema = z.object({
  medical_record_id: z.number(),
  product_id: z.number(),
  qty: z.number().int().positive(),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionInputSchema>;

// Sales transaction schemas
export const salesTransactionSchema = z.object({
  id: z.number(),
  kasir_id: z.number(),
  patient_id: z.number().nullable(),
  tanggal: z.coerce.date(),
  total: z.number(),
  bayar: z.number(),
  kembalian: z.number(),
});

export type SalesTransaction = z.infer<typeof salesTransactionSchema>;

export const createSalesTransactionInputSchema = z.object({
  kasir_id: z.number(),
  patient_id: z.number().nullable(),
  total: z.number().positive(),
  bayar: z.number().positive(),
  kembalian: z.number(),
  items: z.array(z.object({
    product_id: z.number(),
    qty: z.number().int().positive(),
    harga: z.number().positive(),
    subtotal: z.number().positive(),
  })).min(1),
});

export type CreateSalesTransactionInput = z.infer<typeof createSalesTransactionInputSchema>;

// Sales transaction item schemas
export const salesTransactionItemSchema = z.object({
  id: z.number(),
  sales_transaction_id: z.number(),
  product_id: z.number(),
  qty: z.number().int().positive(),
  harga: z.number(),
  subtotal: z.number(),
});

export type SalesTransactionItem = z.infer<typeof salesTransactionItemSchema>;

// Purchase transaction schemas
export const purchaseTransactionSchema = z.object({
  id: z.number(),
  supplier_id: z.number(),
  kasir_id: z.number(),
  tanggal: z.coerce.date(),
  total: z.number(),
});

export type PurchaseTransaction = z.infer<typeof purchaseTransactionSchema>;

export const createPurchaseTransactionInputSchema = z.object({
  supplier_id: z.number(),
  kasir_id: z.number(),
  total: z.number().positive(),
  items: z.array(z.object({
    product_id: z.number(),
    qty: z.number().int().positive(),
    harga: z.number().positive(),
    subtotal: z.number().positive(),
  })).min(1),
});

export type CreatePurchaseTransactionInput = z.infer<typeof createPurchaseTransactionInputSchema>;

// Purchase transaction item schemas
export const purchaseTransactionItemSchema = z.object({
  id: z.number(),
  purchase_transaction_id: z.number(),
  product_id: z.number(),
  qty: z.number().int().positive(),
  harga: z.number(),
  subtotal: z.number(),
});

export type PurchaseTransactionItem = z.infer<typeof purchaseTransactionItemSchema>;

// Dashboard schemas
export const adminDashboardSchema = z.object({
  totalPatients: z.number(),
  totalDoctors: z.number(),
  totalCashiers: z.number(),
  lowStockProducts: z.number(),
  todaySales: z.number(),
  todayPurchases: z.number(),
  recentTransactions: z.array(z.object({
    id: z.number(),
    type: z.enum(['sales', 'purchase']),
    total: z.number(),
    tanggal: z.coerce.date(),
  })),
});

export type AdminDashboard = z.infer<typeof adminDashboardSchema>;

export const dokterDashboardSchema = z.object({
  totalPatients: z.number(),
  todayMedicalRecords: z.number(),
  recentMedicalRecords: z.array(z.object({
    id: z.number(),
    patient_name: z.string(),
    keluhan: z.string(),
    created_at: z.coerce.date(),
  })),
});

export type DokterDashboard = z.infer<typeof dokterDashboardSchema>;

export const kasirDashboardSchema = z.object({
  todaySales: z.number(),
  todayPurchases: z.number(),
  recentSalesTransactions: z.array(z.object({
    id: z.number(),
    total: z.number(),
    tanggal: z.coerce.date(),
  })),
  recentPurchaseTransactions: z.array(z.object({
    id: z.number(),
    total: z.number(),
    tanggal: z.coerce.date(),
  })),
});

export type KasirDashboard = z.infer<typeof kasirDashboardSchema>;