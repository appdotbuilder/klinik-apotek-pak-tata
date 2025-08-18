import { initTRPC, TRPCError } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  loginInputSchema,
  createUserInputSchema,
  updateUserInputSchema,
  createPatientInputSchema,
  updatePatientInputSchema,
  createSupplierInputSchema,
  updateSupplierInputSchema,
  createProductInputSchema,
  updateProductInputSchema,
  createMedicalRecordInputSchema,
  createPrescriptionInputSchema,
  createSalesTransactionInputSchema,
  createPurchaseTransactionInputSchema
} from './schema';

// Import handlers
import { loginUser, validateUserRole } from './handlers/auth';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './handlers/users';
import { createPatient, getPatients, getPatientById, updatePatient, deletePatient } from './handlers/patients';
import { createSupplier, getSuppliers, getSupplierById, updateSupplier, deleteSupplier } from './handlers/suppliers';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getLowStockProducts } from './handlers/products';
import { createMedicalRecord, getMedicalRecords, getMedicalRecordById, getMedicalRecordsByPatientId, getMedicalRecordsByDokterId } from './handlers/medical_records';
import { createPrescription, getPrescriptionsByMedicalRecordId, deletePrescription } from './handlers/prescriptions';
import { createSalesTransaction, getSalesTransactions, getSalesTransactionById, getSalesTransactionsByKasirId, getSalesTransactionsByPatientId, getSalesTransactionItems, getTodaySalesTotal } from './handlers/sales_transactions';
import { createPurchaseTransaction, getPurchaseTransactions, getPurchaseTransactionById, getPurchaseTransactionsByKasirId, getPurchaseTransactionsBySupplierId, getPurchaseTransactionItems, getTodayPurchasesTotal } from './handlers/purchase_transactions';
import { getAdminDashboard, getDokterDashboard, getKasirDashboard } from './handlers/dashboard';

// Context for user authentication
interface Context {
  userId?: number;
  userRole?: string;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const publicProcedure = t.procedure;

// Middleware for role-based access control
const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      userId: ctx.userId,
      userRole: ctx.userRole,
    },
  });
});

const requireRole = (allowedRoles: string[]) =>
  requireAuth.unstable_pipe(({ ctx, next }) => {
    if (!ctx.userRole || !allowedRoles.includes(ctx.userRole)) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    return next({ ctx });
  });

// Protected procedures
const adminProcedure = t.procedure.use(requireRole(['admin']));
const dokterProcedure = t.procedure.use(requireRole(['admin', 'dokter']));
const kasirProcedure = t.procedure.use(requireRole(['admin', 'kasir']));
const authProcedure = t.procedure.use(requireAuth);

const appRouter = t.router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication
  auth: t.router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => loginUser(input)),
  }),

  // User management (Admin only)
  users: t.router({
    create: adminProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => createUser(input)),
    getAll: adminProcedure
      .query(() => getUsers()),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserById(input.id)),
    update: adminProcedure
      .input(updateUserInputSchema)
      .mutation(({ input }) => updateUser(input)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteUser(input.id)),
  }),

  // Patient management
  patients: t.router({
    create: authProcedure
      .input(createPatientInputSchema)
      .mutation(({ input }) => createPatient(input)),
    getAll: authProcedure
      .query(() => getPatients()),
    getById: authProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getPatientById(input.id)),
    update: authProcedure
      .input(updatePatientInputSchema)
      .mutation(({ input }) => updatePatient(input)),
    delete: authProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePatient(input.id)),
  }),

  // Supplier management (Admin and Kasir)
  suppliers: t.router({
    create: kasirProcedure
      .input(createSupplierInputSchema)
      .mutation(({ input }) => createSupplier(input)),
    getAll: kasirProcedure
      .query(() => getSuppliers()),
    getById: kasirProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getSupplierById(input.id)),
    update: kasirProcedure
      .input(updateSupplierInputSchema)
      .mutation(({ input }) => updateSupplier(input)),
    delete: kasirProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteSupplier(input.id)),
  }),

  // Product management
  products: t.router({
    create: kasirProcedure
      .input(createProductInputSchema)
      .mutation(({ input }) => createProduct(input)),
    getAll: authProcedure
      .query(() => getProducts()),
    getById: authProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getProductById(input.id)),
    update: kasirProcedure
      .input(updateProductInputSchema)
      .mutation(({ input }) => updateProduct(input)),
    delete: kasirProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteProduct(input.id)),
    getLowStock: authProcedure
      .input(z.object({ threshold: z.number().optional() }))
      .query(({ input }) => getLowStockProducts(input.threshold)),
  }),

  // Medical records management (Dokter)
  medicalRecords: t.router({
    create: dokterProcedure
      .input(createMedicalRecordInputSchema)
      .mutation(({ input }) => createMedicalRecord(input)),
    getAll: dokterProcedure
      .query(() => getMedicalRecords()),
    getById: dokterProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMedicalRecordById(input.id)),
    getByPatientId: dokterProcedure
      .input(z.object({ patientId: z.number() }))
      .query(({ input }) => getMedicalRecordsByPatientId(input.patientId)),
    getByDokterId: dokterProcedure
      .input(z.object({ dokterId: z.number() }))
      .query(({ input }) => getMedicalRecordsByDokterId(input.dokterId)),
  }),

  // Prescriptions management (Dokter)
  prescriptions: t.router({
    create: dokterProcedure
      .input(createPrescriptionInputSchema)
      .mutation(({ input }) => createPrescription(input)),
    getByMedicalRecordId: dokterProcedure
      .input(z.object({ medicalRecordId: z.number() }))
      .query(({ input }) => getPrescriptionsByMedicalRecordId(input.medicalRecordId)),
    delete: dokterProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePrescription(input.id)),
  }),

  // Sales transactions (Kasir)
  salesTransactions: t.router({
    create: kasirProcedure
      .input(createSalesTransactionInputSchema)
      .mutation(({ input }) => createSalesTransaction(input)),
    getAll: kasirProcedure
      .query(() => getSalesTransactions()),
    getById: kasirProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getSalesTransactionById(input.id)),
    getByKasirId: kasirProcedure
      .input(z.object({ kasirId: z.number() }))
      .query(({ input }) => getSalesTransactionsByKasirId(input.kasirId)),
    getByPatientId: kasirProcedure
      .input(z.object({ patientId: z.number() }))
      .query(({ input }) => getSalesTransactionsByPatientId(input.patientId)),
    getItems: kasirProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(({ input }) => getSalesTransactionItems(input.transactionId)),
    getTodayTotal: kasirProcedure
      .query(() => getTodaySalesTotal()),
  }),

  // Purchase transactions (Kasir)
  purchaseTransactions: t.router({
    create: kasirProcedure
      .input(createPurchaseTransactionInputSchema)
      .mutation(({ input }) => createPurchaseTransaction(input)),
    getAll: kasirProcedure
      .query(() => getPurchaseTransactions()),
    getById: kasirProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getPurchaseTransactionById(input.id)),
    getByKasirId: kasirProcedure
      .input(z.object({ kasirId: z.number() }))
      .query(({ input }) => getPurchaseTransactionsByKasirId(input.kasirId)),
    getBySupplierId: kasirProcedure
      .input(z.object({ supplierId: z.number() }))
      .query(({ input }) => getPurchaseTransactionsBySupplierId(input.supplierId)),
    getItems: kasirProcedure
      .input(z.object({ transactionId: z.number() }))
      .query(({ input }) => getPurchaseTransactionItems(input.transactionId)),
    getTodayTotal: kasirProcedure
      .query(() => getTodayPurchasesTotal()),
  }),

  // Dashboard (Role-based)
  dashboard: t.router({
    admin: adminProcedure
      .query(() => getAdminDashboard()),
    dokter: dokterProcedure
      .input(z.object({ dokterId: z.number() }))
      .query(({ input }) => getDokterDashboard(input.dokterId)),
    kasir: kasirProcedure
      .input(z.object({ kasirId: z.number() }))
      .query(({ input }) => getKasirDashboard(input.kasirId)),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext({ req }): Context {
      // In a real implementation, extract user info from JWT token or session
      // This is a placeholder for authentication context
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Parse JWT token and extract user info
        return {
          userId: 1, // Placeholder
          userRole: 'admin', // Placeholder
        };
      }
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();