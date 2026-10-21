import { PoliceDataRequest, IPoliceDataRequestDocument } from '../models/PoliceDataRequest';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import bcrypt from 'bcryptjs';
import { sendCredentialsEmail } from '../utils/email';

export class DataRequestService {
  /**
   * Submit a new formal official data request
   */
  public static async createRequest(
    userId: string,
    userEmail: string,
    payload: {
      officerName: string;
      badgeNumber: string;
      rank: string;
      policeStation: string;
      districts: string[];
      contactPhone: string;
      officialEmail?: string;
      idProofType: 'POLICE_ID_CARD' | 'COURT_ORDER' | 'DEPT_MEMO' | 'OFFICIAL_WARRANT';
      idProofNumber: string;
      idProofAttachment?: string;
      firNumber: string;
      requestedDataScope: string;
      purposeDescription: string;
      urgencyLevel: 'ROUTINE' | 'HIGH_PRIORITY' | 'ACTIVE_INVESTIGATION_EMERGENCY';
      statutoryDeclaration: boolean;
    }
  ): Promise<IPoliceDataRequestDocument> {
    if (!payload.statutoryDeclaration) {
      throw new Error('Statutory declaration and legal oath under the Indian Police Act is mandatory.');
    }

    if (!payload.idProofNumber || !payload.badgeNumber || !payload.firNumber) {
      throw new Error('Valid Badge Number, Official ID Proof, and FIR / Case Reference are strictly required.');
    }

    const request = new PoliceDataRequest({
      userId,
      userEmail,
      officerName: payload.officerName,
      badgeNumber: payload.badgeNumber,
      rank: payload.rank,
      policeStation: payload.policeStation,
      districts: payload.districts,
      contactPhone: payload.contactPhone,
      officialEmail: payload.officialEmail || userEmail,
      idProofType: payload.idProofType,
      idProofNumber: payload.idProofNumber,
      idProofAttachment: payload.idProofAttachment || 'officer_id_verification_token.pdf',
      firNumber: payload.firNumber,
      requestedDataScope: payload.requestedDataScope,
      purposeDescription: payload.purposeDescription,
      urgencyLevel: payload.urgencyLevel,
      statutoryDeclaration: true,
      status: 'PENDING',
    });

    await request.save();

    // Log security audit event
    await AuditLog.create({
      userId,
      userEmail,
      action: 'DATA_REQUISITION_SUBMITTED',
      resource: 'PoliceDataRequest',
      resourceId: request._id.toString(),
      metadata: {
        badgeNumber: payload.badgeNumber,
        rank: payload.rank,
        policeStation: payload.policeStation,
        districts: payload.districts,
        firNumber: payload.firNumber,
        urgency: payload.urgencyLevel,
      },
      timestamp: new Date(),
    });

    return request;
  }

  /**
   * Get all requests submitted by a specific user
   */
  public static async getMyRequests(userId: string): Promise<IPoliceDataRequestDocument[]> {
    return PoliceDataRequest.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Get all requests (Admin View) with optional filters
   */
  public static async getAllRequests(filters: {
    status?: string;
    district?: string;
    urgency?: string;
    search?: string;
  } = {}): Promise<IPoliceDataRequestDocument[]> {
    const query: any = {};
    if (filters.status && filters.status !== 'ALL') {
      query.status = filters.status;
    }
    if (filters.district && filters.district !== 'ALL') {
      query.districts = filters.district;
    }
    if (filters.urgency && filters.urgency !== 'ALL') {
      query.urgencyLevel = filters.urgency;
    }
    if (filters.search) {
      query.$or = [
        { officerName: { $regex: filters.search, $options: 'i' } },
        { badgeNumber: { $regex: filters.search, $options: 'i' } },
        { policeStation: { $regex: filters.search, $options: 'i' } },
        { firNumber: { $regex: filters.search, $options: 'i' } },
        { idProofNumber: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return PoliceDataRequest.find(query).sort({ createdAt: -1 }).populate('userId', 'name email role');
  }

  /**
   * Get single request details
   */
  public static async getRequestById(id: string): Promise<IPoliceDataRequestDocument | null> {
    return PoliceDataRequest.findById(id).populate('userId', 'name email role').populate('reviewedBy', 'name email');
  }

  /**
   * Review (Approve or Reject) a police data request (Admin Only)
   */
  public static async reviewRequest(
    requestId: string,
    adminId: string,
    adminEmail: string,
    decision: {
      status: 'APPROVED' | 'REJECTED';
      adminRemarks: string;
      grantPoliceRole?: boolean;
    }
  ): Promise<IPoliceDataRequestDocument> {
    const request = await PoliceDataRequest.findById(requestId);
    if (!request) {
      throw new Error('Data requisition record not found');
    }

    request.status = decision.status;
    request.adminRemarks = decision.adminRemarks || (decision.status === 'APPROVED' ? 'Formal request verified and approved by Department Administrator.' : 'Request declined due to inadequate verification details.');
    request.reviewedBy = adminId as any;
    request.reviewedAt = new Date();

    await request.save();

    // If approved and grantPoliceRole is true (or defaulted for police requests), elevate the user account role to POLICE
    if (decision.status === 'APPROVED' && decision.grantPoliceRole !== false) {
      let user = null;
      if (request.userId) {
        user = await User.findById(request.userId);
      }
      
      if (!user && request.officialEmail) {
        const targetEmail = request.officialEmail.toLowerCase();
        // First check if a user with this email already exists
        user = await User.findOne({ email: targetEmail });
        
        if (!user) {
          // Generate new user if they don't exist
          const generatedPassword = Math.random().toString(36).slice(-10);
          const passwordHash = await bcrypt.hash(generatedPassword, 10);
          user = await User.create({
            name: request.officerName,
            email: targetEmail,
            passwordHash,
            role: 'POLICE',
            isActive: true,
            notifications: [
              {
                message: `Welcome ${request.officerName}! Your official request has been approved. You now have POLICE access.`,
                read: false,
              }
            ]
          });
          
          // Send Email to newly created user
          await sendCredentialsEmail(user.email, user.name, generatedPassword);
        }

        // Link to request regardless of whether they were just created or pre-existing
        request.userId = user._id.toString();
        request.userEmail = user.email;
        await request.save();
      }

      if (user && user.role === 'USER') {
        user.role = 'POLICE';
        
        // Add notification for existing user
        if (!user.notifications) user.notifications = [];
        user.notifications.push({
           message: `Your data requisition (FIR: ${request.firNumber}) has been approved. Your role has been elevated to POLICE.`,
           read: false,
           createdAt: new Date(),
        });
        
        await user.save();

        await AuditLog.create({
          userId: adminId,
          userEmail: adminEmail,
          action: 'USER_ROLE_ELEVATED_TO_POLICE',
          resource: 'User',
          resourceId: user._id.toString(),
          metadata: {
            promotedEmail: user.email,
            originatingRequestId: request._id.toString(),
            badgeNumber: request.badgeNumber,
          },
          timestamp: new Date(),
        });
      }
    }

    // Log security review audit
    await AuditLog.create({
      userId: adminId,
      userEmail: adminEmail,
      action: `DATA_REQUISITION_${decision.status}`,
      resource: 'PoliceDataRequest',
      resourceId: request._id.toString(),
      metadata: {
        decision: decision.status,
        officerBadge: request.badgeNumber,
        remarks: request.adminRemarks,
      },
      timestamp: new Date(),
    });

    return request;
  }

  /**
   * Get requisition summary statistics for Admin
   */
  public static async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      PoliceDataRequest.countDocuments(),
      PoliceDataRequest.countDocuments({ status: 'PENDING' }),
      PoliceDataRequest.countDocuments({ status: 'APPROVED' }),
      PoliceDataRequest.countDocuments({ status: 'REJECTED' }),
    ]);

    return { total, pending, approved, rejected };
  }
}
