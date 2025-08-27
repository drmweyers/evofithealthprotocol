# Story: Email System Domain Verification

**Story ID:** STORY-003  
**Priority:** 🟡 Medium  
**Effort:** 3 days  
**Type:** Feature Enhancement  
**Created:** 2025-08-25  
**Status:** Ready for Development  

---

## Story Overview

### Problem Statement
The HealthProtocol application currently has email functionality configured for development with placeholder domains and test credentials. For production deployment, we need to verify and configure the email system with a production domain, implement proper email templates, validate deliverability, and ensure compliance with email security standards (SPF, DKIM, DMARC).

### Business Value
- **Professional Communication:** Emails sent from verified production domain enhance trust
- **Deliverability:** Proper domain verification prevents emails from being marked as spam
- **Compliance:** Meets email security standards required by major email providers
- **User Experience:** Consistent branding and professional email templates
- **Production Readiness:** Email system ready for customer invitations and notifications

### Success Criteria
- [ ] Production domain configured and verified with email service provider
- [ ] SPF, DKIM, and DMARC records properly configured for domain
- [ ] Email templates updated with production branding and content
- [ ] Email deliverability validated to major providers (Gmail, Outlook, Yahoo)
- [ ] Customer invitation emails working with production domain
- [ ] PDF export email functionality verified in production environment
- [ ] Email bounce and error handling implemented
- [ ] Unsubscribe functionality compliant with CAN-SPAM requirements

---

## Technical Context

### Current State Analysis
```
Current Email Configuration:
1. Development SMTP settings with placeholder credentials
2. Basic email templates without production branding
3. No domain verification or DNS configuration
4. Limited error handling for email failures
5. No bounce handling or unsubscribe management
6. Email service configured for development testing only
```

### Architecture Decision
Based on our production infrastructure, we will implement:
- **Email Service:** Resend API (modern, reliable) as primary with SMTP fallback
- **Domain:** Configure production domain with proper DNS records
- **Templates:** Professional HTML email templates with EvoFit branding
- **Deliverability:** Implement best practices for inbox placement

### Technical Dependencies
- Production domain registration and DNS control
- Email service provider account (Resend recommended)
- DNS configuration access for SPF/DKIM/DMARC
- HTML email template system
- Email tracking and analytics (optional)

---

## Implementation Details

### Step 1: Email Service Provider Setup
```typescript
// server/services/email/emailProvider.ts
import { Resend } from 'resend';

interface EmailProvider {
  sendEmail(params: EmailParams): Promise<EmailResult>;
  verifyDeliverability(): Promise<boolean>;
}

export class ResendEmailProvider implements EmailProvider {
  private resend: Resend;
  
  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is required');
    }
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      const result = await this.resend.emails.send({
        from: params.from || process.env.FROM_EMAIL!,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        attachments: params.attachments
      });
      
      return {
        success: true,
        messageId: result.data?.id,
        provider: 'resend'
      };
    } catch (error) {
      console.error('Resend email failed:', error);
      return {
        success: false,
        error: error.message,
        provider: 'resend'
      };
    }
  }
  
  async verifyDeliverability(): Promise<boolean> {
    // Check domain verification status
    try {
      const domains = await this.resend.domains.list();
      const productionDomain = process.env.EMAIL_DOMAIN;
      
      return domains.data?.some(domain => 
        domain.name === productionDomain && domain.status === 'verified'
      ) || false;
    } catch (error) {
      console.error('Domain verification check failed:', error);
      return false;
    }
  }
}
```

### Step 2: Email Template System
```typescript
// server/templates/emailTemplates.ts
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailTemplateService {
  private brandingConfig = {
    logoUrl: process.env.BRAND_LOGO_URL || 'https://yourdomain.com/logo.png',
    brandName: 'EvoFit Health Protocol',
    brandColor: '#0066cc',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
    unsubscribeUrl: process.env.UNSUBSCRIBE_URL || 'https://yourdomain.com/unsubscribe'
  };
  
  generateCustomerInvitation(data: {
    customerName: string;
    trainerName: string;
    invitationUrl: string;
  }): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${this.brandingConfig.brandName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-height: 60px; }
          .button { 
            display: inline-block; 
            background: ${this.brandingConfig.brandColor}; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
            font-size: 12px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${this.brandingConfig.logoUrl}" alt="${this.brandingConfig.brandName}" class="logo">
            <h1>Welcome to Your Health Journey!</h1>
          </div>
          
          <p>Hi ${data.customerName},</p>
          
          <p>Your trainer <strong>${data.trainerName}</strong> has invited you to join ${this.brandingConfig.brandName}. 
          Our platform will help you track your health protocols, receive personalized meal plans, and monitor your progress.</p>
          
          <div style="text-align: center;">
            <a href="${data.invitationUrl}" class="button">Accept Invitation & Create Account</a>
          </div>
          
          <p>This invitation will expire in 7 days. If you have any questions, please contact your trainer or our support team.</p>
          
          <p>Best regards,<br>The ${this.brandingConfig.brandName} Team</p>
          
          <div class="footer">
            <p>This email was sent by ${this.brandingConfig.brandName}</p>
            <p>If you don't want to receive these emails, you can <a href="${this.brandingConfig.unsubscribeUrl}">unsubscribe</a>.</p>
            <p>Support: <a href="mailto:${this.brandingConfig.supportEmail}">${this.brandingConfig.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      Welcome to ${this.brandingConfig.brandName}!
      
      Hi ${data.customerName},
      
      Your trainer ${data.trainerName} has invited you to join our health protocol platform.
      
      Accept your invitation: ${data.invitationUrl}
      
      This invitation expires in 7 days.
      
      Best regards,
      The ${this.brandingConfig.brandName} Team
      
      Support: ${this.brandingConfig.supportEmail}
      Unsubscribe: ${this.brandingConfig.unsubscribeUrl}
    `;
    
    return {
      subject: `Welcome to ${this.brandingConfig.brandName} - Invitation from ${data.trainerName}`,
      html,
      text
    };
  }
  
  generateProtocolPDF(data: {
    customerName: string;
    protocolName: string;
    pdfUrl: string;
    expirationDate: string;
  }): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Health Protocol is Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .button { 
            display: inline-block; 
            background: ${this.brandingConfig.brandColor}; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Health Protocol is Ready!</h1>
          </div>
          
          <p>Hi ${data.customerName},</p>
          
          <p>Your personalized health protocol "<strong>${data.protocolName}</strong>" has been generated and is ready for download.</p>
          
          <div style="text-align: center;">
            <a href="${data.pdfUrl}" class="button">Download Your Protocol (PDF)</a>
          </div>
          
          <p><strong>Important:</strong> This download link will expire on ${data.expirationDate} for security purposes.</p>
          
          <p>Your protocol includes personalized recommendations, meal plans, and guidelines tailored specifically for your health goals.</p>
          
          <p>Best regards,<br>The ${this.brandingConfig.brandName} Team</p>
        </div>
      </body>
      </html>
    `;
    
    return {
      subject: `Your Health Protocol: ${data.protocolName} is Ready`,
      html,
      text: `Your personalized health protocol "${data.protocolName}" is ready for download: ${data.pdfUrl}`
    };
  }
}
```

### Step 3: Domain Configuration & DNS Setup
```bash
# DNS Records Required for Email Deliverability

# SPF Record (TXT)
# Purpose: Specifies which servers are allowed to send email for your domain
yourdomain.com TXT "v=spf1 include:_spf.resend.com ~all"

# DKIM Record (TXT) 
# Purpose: Enables email authentication and prevents tampering
# Note: Get the exact DKIM record from your email service provider
resend._domainkey.yourdomain.com TXT "k=rsa; p=MIGfMA0GCSqGSIb3DQEBA..."

# DMARC Record (TXT)
# Purpose: Tells receiving servers how to handle emails that fail SPF/DKIM
_dmarc.yourdomain.com TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"

# MX Record (if hosting email)
# Purpose: Specifies mail server for your domain
yourdomain.com MX 10 mail.yourdomain.com
```

### Step 4: Email Deliverability Testing
```typescript
// server/utils/emailDeliverabilityTest.ts
export class EmailDeliverabilityTester {
  private testProviders = [
    'gmail.com',
    'outlook.com', 
    'yahoo.com',
    'icloud.com',
    'proton.me'
  ];
  
  async runDeliverabilityTest(): Promise<DeliverabilityReport> {
    const report: DeliverabilityReport = {
      timestamp: new Date().toISOString(),
      domainVerified: false,
      spfValid: false,
      dkimValid: false,
      dmarcValid: false,
      testResults: []
    };
    
    // Check DNS configuration
    report.spfValid = await this.checkSPFRecord();
    report.dkimValid = await this.checkDKIMRecord();
    report.dmarcValid = await this.checkDMARCRecord();
    
    // Send test emails to different providers
    for (const provider of this.testProviders) {
      if (process.env.TEST_EMAIL_PREFIX) {
        const testEmail = `${process.env.TEST_EMAIL_PREFIX}@${provider}`;
        const result = await this.sendTestEmail(testEmail);
        report.testResults.push(result);
      }
    }
    
    return report;
  }
  
  private async checkSPFRecord(): Promise<boolean> {
    try {
      const dns = require('dns').promises;
      const records = await dns.resolveTxt(process.env.EMAIL_DOMAIN);
      return records.some(record => 
        record.join('').includes('v=spf1') && 
        record.join('').includes('resend.com')
      );
    } catch (error) {
      console.error('SPF check failed:', error);
      return false;
    }
  }
}
```

### Step 5: Bounce and Unsubscribe Handling
```typescript
// server/routes/emailWebhooks.ts
import { Router } from 'express';
const router = Router();

// Resend webhook endpoint for bounce/complaint handling
router.post('/email/webhook/resend', async (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'email.bounced':
      await handleEmailBounce(data);
      break;
    case 'email.complained':
      await handleEmailComplaint(data);
      break;
    case 'email.delivered':
      await handleEmailDelivered(data);
      break;
  }
  
  res.status(200).json({ received: true });
});

async function handleEmailBounce(data: any) {
  console.log(`Email bounced: ${data.email}`);
  
  // Mark email as bounced in database
  // Optionally disable future emails to this address
  await db.update(users)
    .set({ emailBounced: true, emailBounceDate: new Date() })
    .where(eq(users.email, data.email));
}

// Unsubscribe endpoint
router.get('/unsubscribe', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).send('Invalid unsubscribe link');
  }
  
  try {
    // Verify and decode unsubscribe token
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as any;
    
    // Mark user as unsubscribed
    await db.update(users)
      .set({ emailSubscribed: false, unsubscribeDate: new Date() })
      .where(eq(users.id, decoded.userId));
    
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from ${process.env.BRAND_NAME || 'our'} emails.</p>
          <p>If you change your mind, you can re-subscribe from your account settings.</p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(400).send('Invalid or expired unsubscribe link');
  }
});

export default router;
```

---

## Testing Strategy

### Email Deliverability Tests
```typescript
// test/integration/emailDeliverability.test.ts
import { describe, it, expect } from 'vitest';
import { EmailTemplateService } from '../server/templates/emailTemplates.js';
import { ResendEmailProvider } from '../server/services/email/emailProvider.js';

describe('Email System Integration', () => {
  const emailService = new ResendEmailProvider();
  const templateService = new EmailTemplateService();
  
  it('should verify domain is properly configured', async () => {
    const isVerified = await emailService.verifyDeliverability();
    expect(isVerified).toBe(true);
  });
  
  it('should generate valid customer invitation template', () => {
    const template = templateService.generateCustomerInvitation({
      customerName: 'John Doe',
      trainerName: 'Jane Smith',
      invitationUrl: 'https://example.com/invite/123'
    });
    
    expect(template.subject).toContain('Welcome to');
    expect(template.html).toContain('John Doe');
    expect(template.html).toContain('Jane Smith');
    expect(template.html).toContain('unsubscribe');
  });
  
  it('should send test email successfully', async () => {
    if (!process.env.TEST_EMAIL) {
      console.log('Skipping email test - TEST_EMAIL not configured');
      return;
    }
    
    const result = await emailService.sendEmail({
      to: process.env.TEST_EMAIL,
      subject: 'Test Email - Deliverability Check',
      html: '<p>This is a test email to verify deliverability.</p>',
      text: 'This is a test email to verify deliverability.'
    });
    
    expect(result.success).toBe(true);
    expect(result.messageId).toBeTruthy();
  });
});
```

### Manual Testing Checklist
```bash
# 1. DNS Configuration Test
dig TXT yourdomain.com
dig TXT _dmarc.yourdomain.com
dig TXT resend._domainkey.yourdomain.com

# 2. Email Sending Test
curl -X POST http://localhost:8080/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","type":"customer_invitation"}'

# 3. Deliverability Test
node scripts/test-email-deliverability.js

# 4. Unsubscribe Test
curl http://localhost:8080/unsubscribe?token=test-token
```

---

## Acceptance Criteria Checklist

- [ ] **Domain Verification**: Production domain configured and verified with Resend
- [ ] **DNS Configuration**: SPF, DKIM, and DMARC records properly set up
- [ ] **Email Templates**: Professional HTML templates with EvoFit branding implemented
- [ ] **Deliverability Testing**: Validated delivery to Gmail, Outlook, Yahoo, iCloud
- [ ] **Customer Invitations**: Working invitation system with production domain
- [ ] **PDF Email Functionality**: Protocol PDFs delivered successfully via email
- [ ] **Bounce Handling**: Email bounce and complaint handling implemented
- [ ] **Unsubscribe Compliance**: CAN-SPAM compliant unsubscribe system
- [ ] **Error Handling**: Comprehensive error handling for email failures
- [ ] **Production Environment**: Email system working in production configuration

---

## Definition of Done

1. **Domain Configured**: Production domain verified with email service provider
2. **DNS Records Set**: SPF, DKIM, DMARC configured and validated
3. **Templates Ready**: Professional email templates implemented and tested
4. **Deliverability Verified**: High inbox placement rate confirmed across major providers
5. **Integration Complete**: Email system integrated with customer invitation workflow
6. **Compliance Met**: CAN-SPAM and email marketing regulations compliance verified
7. **Documentation Updated**: Email configuration documented for production deployment
8. **Testing Passed**: All email functionality tested in production environment

---

## Risk Mitigation

### Identified Risks
1. **Email Deliverability Issues**: Emails marked as spam by major providers
   - *Mitigation:* Proper DNS configuration, gradual sending ramp-up, content optimization
   
2. **Domain Reputation Problems**: New domain has low sender reputation  
   - *Mitigation:* Start with low volume, implement authentication, monitor bounce rates
   
3. **Compliance Violations**: CAN-SPAM or GDPR non-compliance
   - *Mitigation:* Implement proper unsubscribe, data handling, and consent mechanisms
   
4. **Email Service Downtime**: Email service provider outages
   - *Mitigation:* Implement fallback SMTP provider, queue failed emails for retry

---

## Notes for Developer

### Production Email Configuration
```bash
# Required environment variables for production
EMAIL_DOMAIN=yourdomain.com
RESEND_API_KEY=re_your_production_key
FROM_EMAIL="EvoFit Health Protocol <noreply@yourdomain.com>"
SUPPORT_EMAIL=support@yourdomain.com
BRAND_LOGO_URL=https://yourdomain.com/assets/logo.png

# Optional: Backup SMTP (fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_app_password
```

### Quick Testing Commands
```bash
# Test domain DNS configuration
node -e "require('./server/utils/emailDeliverabilityTest.js').checkDNSConfiguration()"

# Send test email
curl -X POST localhost:8080/api/test/send-invitation \
  -d '{"email":"your-email@gmail.com","customerName":"Test User"}'

# Check email deliverability report
curl localhost:8080/api/admin/email-deliverability-report
```

---

## References
- [Resend API Documentation](https://resend.com/docs)
- [Email Authentication Best Practices (SPF/DKIM/DMARC)](https://dmarcian.com/email-authentication/)
- [CAN-SPAM Act Compliance Guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-deliverability-guide/)

---

_This story follows BMAD methodology with complete context for implementation. Ready for development phase._