import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTicket,
  addMessage,
  rateTicket,
  getAllTickets,
  getTicketsByStatus,
  getTicketsByPriority,
  getAssignedTickets,
  getOverdueTickets,
  assignTicket,
  changeStatus,
  changePriority,
  updateTicket,
  deleteTicket,
  resolveTicket,
  closeTicket,
  reopenTicket,
  addInternalNote,
  bulkAssignTickets,
  bulkUpdateStatus,
  getTicketStats
} from '../controllers/support.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// ==================== USER ROUTES ====================
// All user routes require authentication

router.use(protect);

// Create ticket
router.post('/tickets', createTicket);

// Get user's tickets
router.get('/tickets/my-tickets', getMyTickets);

// Get single ticket
router.get('/tickets/:id', getTicket);

// Add message to ticket
router.post('/tickets/:id/messages', addMessage);

// Rate ticket
router.post('/tickets/:id/rate', rateTicket);

// ==================== ADMIN ROUTES ====================

// Statistics
router.get('/tickets/admin/stats', restrictTo('admin'), getTicketStats);

// Get all tickets
router.get('/tickets/admin/all', restrictTo('admin'), getAllTickets);

// Get tickets by status
router.get(
  '/tickets/admin/status/:status',
  restrictTo('admin'),
  getTicketsByStatus
);

// Get tickets by priority
router.get(
  '/tickets/admin/priority/:priority',
  restrictTo('admin'),
  getTicketsByPriority
);

// Get assigned tickets
router.get('/tickets/admin/assigned', restrictTo('admin'), getAssignedTickets);

// Get overdue tickets
router.get('/tickets/admin/overdue', restrictTo('admin'), getOverdueTickets);

// Bulk operations
router.patch(
  '/tickets/admin/bulk-assign',
  restrictTo('admin'),
  bulkAssignTickets
);
router.patch(
  '/tickets/admin/bulk-status',
  restrictTo('admin'),
  bulkUpdateStatus
);

// Ticket actions
router.patch('/tickets/:id/assign', restrictTo('admin'), assignTicket);
router.patch('/tickets/:id/status', restrictTo('admin'), changeStatus);
router.patch('/tickets/:id/priority', restrictTo('admin'), changePriority);
router.post('/tickets/:id/resolve', restrictTo('admin'), resolveTicket);
router.post('/tickets/:id/close', restrictTo('admin'), closeTicket);
router.post('/tickets/:id/reopen', restrictTo('admin'), reopenTicket);
router.post('/tickets/:id/internal-note', restrictTo('admin'), addInternalNote);

// CRUD operations
router.patch('/tickets/:id', restrictTo('admin'), updateTicket);
router.delete('/tickets/:id', restrictTo('admin'), deleteTicket);

export default router;
