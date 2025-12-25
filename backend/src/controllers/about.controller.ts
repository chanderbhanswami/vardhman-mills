import { Request, Response, NextFunction } from 'express';
import {
  CompanyInfo,
  HistoryEntry,
  TeamMember,
  Award,
  CompanyLocation,
  CompanyStats
} from '../models/about.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// ============================================
// COMPANY INFO
// ============================================

// Get company info
export const getCompanyInfo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const companyInfo = await CompanyInfo.findOne().lean();

  if (!companyInfo) {
    return next(new AppError('Company information not found', 404));
  }

  res.status(200).json({
    success: true,
    data: companyInfo
  });
});

// Create/Update company info
export const updateCompanyInfo = catchAsync(async (req: Request, res: Response) => {
  const companyInfo = await CompanyInfo.findOneAndUpdate(
    {},
    req.body,
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Company information updated successfully',
    data: companyInfo
  });
});

// ============================================
// HISTORY
// ============================================

// Get all history entries
export const getHistory = catchAsync(async (req: Request, res: Response) => {
  const { isActive, year } = req.query;

  const query: any = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  if (year) {
    query.year = Number(year);
  }

  const history = await HistoryEntry.find(query)
    .sort({ year: -1, sortOrder: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
});

// Get history entry by ID
export const getHistoryById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const history = await HistoryEntry.findById(req.params.id).lean();

  if (!history) {
    return next(new AppError('History entry not found', 404));
  }

  res.status(200).json({
    success: true,
    data: history
  });
});

// Create history entry
export const createHistoryEntry = catchAsync(async (req: Request, res: Response) => {
  const history = await HistoryEntry.create(req.body);

  res.status(201).json({
    success: true,
    message: 'History entry created successfully',
    data: history
  });
});

// Update history entry
export const updateHistoryEntry = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const history = await HistoryEntry.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!history) {
    return next(new AppError('History entry not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'History entry updated successfully',
    data: history
  });
});

// Delete history entry
export const deleteHistoryEntry = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const history = await HistoryEntry.findById(req.params.id);

  if (!history) {
    return next(new AppError('History entry not found', 404));
  }

  // Delete image if exists
  if (history.image) {
    await deleteFromCloudinary(history.image);
  }

  await history.deleteOne();

  res.status(200).json({
    success: true,
    message: 'History entry deleted successfully'
  });
});

// ============================================
// TEAM MEMBERS
// ============================================

// Get all team members
export const getTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const { 
    page = 1,
    limit = 20,
    isActive,
    isFeatured,
    department
  } = req.query;

  const query: any = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }
  if (department) {
    query.department = department;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [teamMembers, total] = await Promise.all([
    TeamMember.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    TeamMember.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: teamMembers.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: teamMembers
  });
});

// Get team member by ID
export const getTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const teamMember = await TeamMember.findById(req.params.id).lean();

  if (!teamMember) {
    return next(new AppError('Team member not found', 404));
  }

  res.status(200).json({
    success: true,
    data: teamMember
  });
});

// Get featured team members
export const getFeaturedTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;

  const teamMembers = await TeamMember.find({ isActive: true, isFeatured: true })
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    count: teamMembers.length,
    data: teamMembers
  });
});

// Create team member
export const createTeamMember = catchAsync(async (req: Request, res: Response) => {
  const teamMember = await TeamMember.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Team member added successfully',
    data: teamMember
  });
});

// Update team member
export const updateTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const teamMember = await TeamMember.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!teamMember) {
    return next(new AppError('Team member not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Team member updated successfully',
    data: teamMember
  });
});

// Delete team member
export const deleteTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const teamMember = await TeamMember.findById(req.params.id);

  if (!teamMember) {
    return next(new AppError('Team member not found', 404));
  }

  // Delete image if exists
  if (teamMember.image) {
    await deleteFromCloudinary(teamMember.image);
  }

  await teamMember.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Team member deleted successfully'
  });
});

// Upload team member image
export const uploadTeamMemberImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const teamMember = await TeamMember.findById(req.params.id);
  if (!teamMember) {
    return next(new AppError('Team member not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  // Delete old image if exists
  if (teamMember.image) {
    await deleteFromCloudinary(teamMember.image);
  }

  // Upload new image
  const result = await uploadToCloudinary(req.file.buffer, 'team');
  teamMember.image = result.secure_url;
  await teamMember.save();

  res.status(200).json({
    success: true,
    message: 'Team member image uploaded successfully',
    data: { image: teamMember.image }
  });
});

// ============================================
// AWARDS & CERTIFICATIONS
// ============================================

// Get all awards
export const getAwards = catchAsync(async (req: Request, res: Response) => {
  const { 
    page = 1,
    limit = 20,
    isActive,
    category,
    year
  } = req.query;

  const query: any = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  if (category) {
    query.category = category;
  }
  if (year) {
    const startDate = new Date(Number(year), 0, 1);
    const endDate = new Date(Number(year), 11, 31, 23, 59, 59);
    query.issuedDate = { $gte: startDate, $lte: endDate };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [awards, total] = await Promise.all([
    Award.find(query)
      .sort({ issuedDate: -1, sortOrder: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Award.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: awards.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: awards
  });
});

// Get award by ID
export const getAwardById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const award = await Award.findById(req.params.id).lean();

  if (!award) {
    return next(new AppError('Award not found', 404));
  }

  res.status(200).json({
    success: true,
    data: award
  });
});

// Create award
export const createAward = catchAsync(async (req: Request, res: Response) => {
  const award = await Award.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Award added successfully',
    data: award
  });
});

// Update award
export const updateAward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const award = await Award.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!award) {
    return next(new AppError('Award not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Award updated successfully',
    data: award
  });
});

// Delete award
export const deleteAward = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const award = await Award.findById(req.params.id);

  if (!award) {
    return next(new AppError('Award not found', 404));
  }

  // Delete image if exists
  if (award.image) {
    await deleteFromCloudinary(award.image);
  }

  await award.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Award deleted successfully'
  });
});

// ============================================
// LOCATIONS
// ============================================

// Get all locations
export const getLocations = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    isActive,
    type,
    city,
    state,
    country
  } = req.query;

  const query: any = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  if (type) {
    query.type = type;
  }
  if (city) {
    query['address.city'] = city;
  }
  if (state) {
    query['address.state'] = state;
  }
  if (country) {
    query['address.country'] = country;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [locations, total] = await Promise.all([
    CompanyLocation.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    CompanyLocation.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: locations.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: locations
  });
});

// Get location by ID
export const getLocationById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await CompanyLocation.findById(req.params.id).lean();

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  res.status(200).json({
    success: true,
    data: location
  });
});

// Create location
export const createLocation = catchAsync(async (req: Request, res: Response) => {
  const location = await CompanyLocation.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Location added successfully',
    data: location
  });
});

// Update location
export const updateLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await CompanyLocation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: location
  });
});

// Delete location
export const deleteLocation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const location = await CompanyLocation.findById(req.params.id);

  if (!location) {
    return next(new AppError('Location not found', 404));
  }

  // Delete image if exists
  if (location.image) {
    await deleteFromCloudinary(location.image);
  }

  await location.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Location deleted successfully'
  });
});

// ============================================
// COMPANY STATISTICS
// ============================================

// Get company statistics
export const getCompanyStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await CompanyStats.findOne().lean();

  if (!stats) {
    return next(new AppError('Company statistics not found', 404));
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});

// Update company statistics
export const updateCompanyStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await CompanyStats.findOneAndUpdate(
    {},
    req.body,
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Company statistics updated successfully',
    data: stats
  });
});

// ============================================
// ADMIN OPERATIONS
// ============================================

// Get departments list
export const getDepartments = catchAsync(async (req: Request, res: Response) => {
  const departments = await TeamMember.distinct('department', { department: { $ne: null } });

  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments
  });
});

// Get overview statistics
export const getOverviewStats = catchAsync(async (req: Request, res: Response) => {
  const [
    companyInfo,
    totalHistory,
    activeHistory,
    totalTeam,
    activeTeam,
    featuredTeam,
    totalAwards,
    activeAwards,
    totalLocations,
    activeLocations,
    companyStats
  ] = await Promise.all([
    CompanyInfo.findOne().lean(),
    HistoryEntry.countDocuments(),
    HistoryEntry.countDocuments({ isActive: true }),
    TeamMember.countDocuments(),
    TeamMember.countDocuments({ isActive: true }),
    TeamMember.countDocuments({ isFeatured: true, isActive: true }),
    Award.countDocuments(),
    Award.countDocuments({ isActive: true }),
    CompanyLocation.countDocuments(),
    CompanyLocation.countDocuments({ isActive: true }),
    CompanyStats.findOne().lean()
  ]);

  const overview = {
    companyInfo: companyInfo ? {
      name: companyInfo.name,
      foundedYear: companyInfo.foundedYear,
      employeeCount: companyInfo.employeeCount
    } : null,
    history: {
      total: totalHistory,
      active: activeHistory,
      inactive: totalHistory - activeHistory
    },
    team: {
      total: totalTeam,
      active: activeTeam,
      featured: featuredTeam,
      inactive: totalTeam - activeTeam
    },
    awards: {
      total: totalAwards,
      active: activeAwards,
      inactive: totalAwards - activeAwards
    },
    locations: {
      total: totalLocations,
      active: activeLocations,
      inactive: totalLocations - activeLocations
    },
    statistics: companyStats
  };

  res.status(200).json({
    success: true,
    data: overview
  });
});
