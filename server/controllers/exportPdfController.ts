/**
 * PDF Export Controller
 * 
 * Handles server-side PDF generation for health protocols using Puppeteer
 * Implements EvoFit brand styling and layout
 */

import { Request, Response } from 'express';
import puppeteer, { Browser } from 'puppeteer';
import dayjs from 'dayjs';
import { validateProtocolForPDF } from '../utils/pdfValidation';

interface ExportOptions {
  includeSupplements?: boolean;
  includeGuidelines?: boolean;
  includePrecautions?: boolean;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter';
}

interface ProtocolPdfExportRequest extends Request {
  body: {
    protocolData: any;
    customerName?: string;
    options?: ExportOptions;
  };
}

/**
 * Export health protocol data to PDF
 */
export async function exportProtocolPdfController(req: ProtocolPdfExportRequest, res: Response): Promise<void> {
  let browser: Browser | null = null;
  
  try {
    // Validate request data
    const { protocolData, customerName, options = {} } = req.body;
    
    if (!protocolData) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Protocol data is required',
        code: 'MISSING_PROTOCOL_DATA'
      });
      return;
    }

    // Validate and transform protocol data
    const validatedProtocol = validateProtocolForPDF(protocolData);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Generate HTML content for the protocol
    const htmlContent = generateProtocolHtml(validatedProtocol, customerName, options);
    
    // Set content and configure PDF options
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfOptions = {
      format: options.pageSize || 'A4' as const,
      orientation: options.orientation || 'portrait' as const,
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    };

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="protocol-${validatedProtocol.name.replace(/\s+/g, '-').toLowerCase()}-${dayjs().format('YYYY-MM-DD')}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error: any) {
    console.error('PDF export error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate PDF',
        code: 'PDF_GENERATION_ERROR',
        details: error.message
      });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate HTML content for health protocol PDF
 */
function generateProtocolHtml(protocol: any, customerName?: string, options: ExportOptions = {}): string {
  const currentDate = dayjs().format('MMMM D, YYYY');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${protocol.name} - Health Protocol</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: #fff;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .content {
            padding: 0 30px;
        }
        
        .protocol-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .supplement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .supplement-card {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .supplement-name {
            font-weight: bold;
            color: #667eea;
            font-size: 1.1em;
            margin-bottom: 10px;
        }
        
        .guideline-item {
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
            border-left: 3px solid #28a745;
        }
        
        .precaution-item {
            background: #fff3cd;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 3px solid #ffc107;
        }
        
        .footer {
            margin-top: 50px;
            padding: 20px;
            background: #f8f9fa;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
        }
        
        @media print {
            .header {
                background: #667eea !important;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>EvoFit Health Protocol</h1>
        <p>Personalized Health & Wellness Program</p>
    </div>
    
    <div class="content">
        <div class="protocol-info">
            <h2 style="margin-top: 0; border: none; color: #333;">${protocol.name}</h2>
            ${customerName ? `<p><strong>Prepared for:</strong> ${customerName}</p>` : ''}
            <p><strong>Protocol Type:</strong> ${protocol.type.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Duration:</strong> ${protocol.duration}</p>
            <p><strong>Generated:</strong> ${currentDate}</p>
            ${protocol.description ? `<p><strong>Description:</strong> ${protocol.description}</p>` : ''}
        </div>
        
        ${options.includeSupplements !== false && protocol.supplements?.length > 0 ? `
        <div class="section">
            <h2>Supplements & Dosages</h2>
            <div class="supplement-grid">
                ${protocol.supplements.map((supplement: any) => `
                    <div class="supplement-card">
                        <div class="supplement-name">${supplement.name}</div>
                        <p><strong>Dosage:</strong> ${supplement.dosage}</p>
                        <p><strong>Timing:</strong> ${supplement.timing}</p>
                        ${supplement.notes ? `<p><strong>Notes:</strong> ${supplement.notes}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${options.includeGuidelines !== false && protocol.guidelines?.length > 0 ? `
        <div class="section">
            <h2>Guidelines & Recommendations</h2>
            ${protocol.guidelines.map((guideline: any) => `
                <div class="guideline-item">
                    <strong>${guideline.category}:</strong> ${guideline.instruction}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${options.includePrecautions !== false && protocol.precautions?.length > 0 ? `
        <div class="section">
            <h2>Important Precautions</h2>
            ${protocol.precautions.map((precaution: string) => `
                <div class="precaution-item">
                    ${precaution}
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
    
    <div class="footer">
        <p>© 2025 EvoFit Health Solutions - Generated by Health Protocol Management System</p>
        <p><em>This protocol is for informational purposes only. Consult with a healthcare professional before starting any new supplement regimen.</em></p>
    </div>
</body>
</html>
  `;
}

// Backward compatibility export
export const exportPdfController = exportProtocolPdfController;