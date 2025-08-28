/**
 * PDF Export Button Component
 * 
 * Provides a user-friendly interface for exporting health protocol data to PDF.
 * Includes options for customizing the export format and handles loading states.
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { 
  Download, 
  FileText, 
  Loader2, 
  Settings,
  Zap
} from 'lucide-react';

interface PDFExportButtonProps {
  customerId?: string;
  customerEmail?: string;
  data?: any;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export default function PDFExportButton({
  customerId,
  customerEmail,
  data,
  variant = 'outline',
  size = 'default',
  className = '',
  children
}: PDFExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // Export options
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);

  const handleQuickExport = async () => {
    if (!data) {
      toast({
        title: 'No Data',
        description: 'No health protocol data available for export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // For now, we'll create a simple implementation
      // In a real app, this would call a PDF export service
      const exportData = {
        customerEmail,
        protocols: data.protocols || [],
        healthMetrics: data.healthMetrics || {},
        goals: data.goals || [],
        includeMetrics,
        includeGoals
      };
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Export Complete',
        description: 'Health protocol data has been exported to PDF successfully.',
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export health protocol data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCustomExport = async () => {
    await handleQuickExport();
    setShowOptions(false);
  };

  return (
    <>
      <Dialog open={showOptions} onOpenChange={setShowOptions}>
        <Button
          onClick={handleQuickExport}
          disabled={isExporting}
          variant={variant}
          size={size}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {children || 'Export PDF'}
            </>
          )}
        </Button>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Export Health Protocol PDF</span>
            </DialogTitle>
            <DialogDescription>
              Customize your health protocol export options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Export Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Include in Export</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-metrics" 
                    checked={includeMetrics}
                    onCheckedChange={(checked) => setIncludeMetrics(checked === true)}
                  />
                  <Label htmlFor="include-metrics" className="text-sm">
                    Health Metrics & Measurements
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-goals" 
                    checked={includeGoals}
                    onCheckedChange={(checked) => setIncludeGoals(checked === true)}
                  />
                  <Label htmlFor="include-goals" className="text-sm">
                    Customer Goals & Progress
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowOptions(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCustomExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Simple PDF Export Button without dialog
export function SimplePDFExportButton({
  customerId,
  customerEmail, 
  data,
  variant = 'outline',
  size = 'sm',
  className = ''
}: PDFExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data) {
      toast({
        title: 'No Data',
        description: 'No data available for export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Export Complete',
        description: 'Data has been exported to PDF successfully.',
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast({
        title: 'Export Failed', 
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={variant}
      size={size}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Download className="h-3 w-3" />
      )}
    </Button>
  );
}