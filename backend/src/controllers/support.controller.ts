import { Request, Response, NextFunction } from 'express';
import SupportTicket from '../models/SupportTicket.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// ==================== USER TICKET OPERATIONS ====================

/**
 * Create support ticket
 * @route POST /api/v1/support/tickets
 * @access Private
 */
export const createTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticketNumber = await SupportTicket.generateTicketNumber();

    const ticketData = {
      ...req.body,
      ticketNumber,
      user: req.user?._id
    };

    const ticket = await SupportTicket.create(ticketData);

    res.status(201).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Get user's tickets
 * @route GET /api/v1/support/tickets/my-tickets
 * @access Private
 */
export const getMyTickets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;

    const query: any = { user: req.user?._id };
    if (status) {
      query.status = status;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name')
      .populate('relatedOrder', 'orderNumber')
      .populate('relatedProduct', 'name images')
      .lean();

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets }
    });
  }
);

/**
 * Get single ticket
 * @route GET /api/v1/support/tickets/:id
 * @access Private
 */
export const getTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('relatedOrder', 'orderNumber totalAmount')
      .populate('relatedProduct', 'name images price')
      .populate('messages.sender', 'name');

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    // Check access: user can only see their own tickets
    if (
      req.user?.role !== 'admin' &&
      ticket.user._id.toString() !== req.user?._id.toString()
    ) {
      return next(new AppError('You do not have access to this ticket', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Add message to ticket
 * @route POST /api/v1/support/tickets/:id/messages
 * @access Private
 */
export const addMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { message, attachments } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    // Check access
    const isAdmin = req.user?.role === 'admin';
    const isOwner = ticket.user.toString() === req.user?._id.toString();

    if (!isAdmin && !isOwner) {
      return next(new AppError('You do not have access to this ticket', 403));
    }

    const senderType = isAdmin ? 'admin' : 'user';
    await ticket.addMessage(
      req.user!._id as any,
      senderType,
      message,
      attachments
    );

    // If user responds, change status from waiting-customer
    if (!isAdmin && ticket.status === 'waiting-customer') {
      ticket.status = 'in-progress';
      await ticket.save();
    }

    res.status(201).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Rate ticket satisfaction
 * @route POST /api/v1/support/tickets/:id/rate
 * @access Private
 */
export const rateTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    // Check if user owns the ticket
    if (ticket.user.toString() !== req.user?._id.toString()) {
      return next(new AppError('You can only rate your own tickets', 403));
    }

    // Only allow rating resolved/closed tickets
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return next(new AppError('You can only rate resolved or closed tickets', 400));
    }

    await ticket.rateSatisfaction(rating, feedback);

    res.status(200).json({
      status: 'success',
      data: { message: 'Thank you for your feedback!' }
    });
  }
);

// ==================== ADMIN TICKET OPERATIONS ====================

/**
 * Get all tickets (Admin)
 * @route GET /api/v1/support/tickets/admin/all
 * @access Private/Admin
 */
export const getAllTickets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    if (req.query.search) {
      query.$or = [
        { ticketNumber: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .populate('user', 'name email')
        .populate('assignedTo', 'name email')
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: {
        tickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  }
);

/**
 * Get tickets by status (Admin)
 * @route GET /api/v1/support/tickets/admin/status/:status
 * @access Private/Admin
 */
export const getTicketsByStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.params;

    const tickets = await SupportTicket.getByStatus(status);

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets }
    });
  }
);

/**
 * Get tickets by priority (Admin)
 * @route GET /api/v1/support/tickets/admin/priority/:priority
 * @access Private/Admin
 */
export const getTicketsByPriority = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { priority } = req.params;

    const tickets = await SupportTicket.getByPriority(priority);

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets }
    });
  }
);

/**
 * Get assigned tickets (Admin/Agent)
 * @route GET /api/v1/support/tickets/admin/assigned
 * @access Private/Admin
 */
export const getAssignedTickets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tickets = await SupportTicket.getAssignedToAgent(
      req.user!._id.toString()
    );

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets }
    });
  }
);

/**
 * Get overdue tickets (Admin)
 * @route GET /api/v1/support/tickets/admin/overdue
 * @access Private/Admin
 */
export const getOverdueTickets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tickets = await SupportTicket.getOverdueTickets();

    res.status(200).json({
      status: 'success',
      results: tickets.length,
      data: { tickets }
    });
  }
);

/**
 * Assign ticket to agent (Admin)
 * @route PATCH /api/v1/support/tickets/:id/assign
 * @access Private/Admin
 */
export const assignTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { agentId } = req.body;

    if (!agentId) {
      return next(new AppError('Agent ID is required', 400));
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.assignToAgent(agentId);

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Change ticket status (Admin)
 * @route PATCH /api/v1/support/tickets/:id/status
 * @access Private/Admin
 */
export const changeStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.changeStatus(status);

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Change ticket priority (Admin)
 * @route PATCH /api/v1/support/tickets/:id/priority
 * @access Private/Admin
 */
export const changePriority = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { priority } = req.body;

    if (!priority) {
      return next(new AppError('Priority is required', 400));
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.changePriority(priority);

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Update ticket (Admin)
 * @route PATCH /api/v1/support/tickets/:id
 * @access Private/Admin
 */
export const updateTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Delete ticket (Admin)
 * @route DELETE /api/v1/support/tickets/:id
 * @access Private/Admin
 */
export const deleteTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  }
);

/**
 * Resolve ticket (Admin)
 * @route POST /api/v1/support/tickets/:id/resolve
 * @access Private/Admin
 */
export const resolveTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.resolve();

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Close ticket (Admin)
 * @route POST /api/v1/support/tickets/:id/close
 * @access Private/Admin
 */
export const closeTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.close();

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Reopen ticket (Admin)
 * @route POST /api/v1/support/tickets/:id/reopen
 * @access Private/Admin
 */
export const reopenTicket = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.reopen();

    res.status(200).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Add internal note (Admin)
 * @route POST /api/v1/support/tickets/:id/internal-note
 * @access Private/Admin
 */
export const addInternalNote = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { message } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    await ticket.addMessage(req.user!._id as any, 'admin', message, [], true);

    res.status(201).json({
      status: 'success',
      data: { ticket }
    });
  }
);

/**
 * Bulk assign tickets (Admin)
 * @route PATCH /api/v1/support/tickets/admin/bulk-assign
 * @access Private/Admin
 */
export const bulkAssignTickets = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticketIds, agentId } = req.body;

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return next(new AppError('Ticket IDs array is required', 400));
    }

    if (!agentId) {
      return next(new AppError('Agent ID is required', 400));
    }

    const result = await SupportTicket.updateMany(
      { _id: { $in: ticketIds } },
      {
        $set: {
          assignedTo: agentId,
          status: 'in-progress'
        }
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        message: `Assigned ${result.modifiedCount} tickets`,
        modifiedCount: result.modifiedCount
      }
    });
  }
);

/**
 * Bulk update status (Admin)
 * @route PATCH /api/v1/support/tickets/admin/bulk-status
 * @access Private/Admin
 */
export const bulkUpdateStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticketIds, status } = req.body;

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return next(new AppError('Ticket IDs array is required', 400));
    }

    if (!status) {
      return next(new AppError('Status is required', 400));
    }

    const updateData: any = { status };
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    } else if (status === 'closed') {
      updateData.closedAt = new Date();
      updateData.resolvedAt = new Date();
    }

    const result = await SupportTicket.updateMany(
      { _id: { $in: ticketIds } },
      { $set: updateData }
    );

    res.status(200).json({
      status: 'success',
      data: {
        message: `Updated ${result.modifiedCount} tickets`,
        modifiedCount: result.modifiedCount
      }
    });
  }
);

/**
 * Get ticket statistics (Admin)
 * @route GET /api/v1/support/tickets/admin/stats
 * @access Private/Admin
 */
export const getTicketStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await SupportTicket.getTicketStats(start, end);

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  }
);

export default {
  // User operations
  createTicket,
  getMyTickets,
  getTicket,
  addMessage,
  rateTicket,

  // Admin operations
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
};
