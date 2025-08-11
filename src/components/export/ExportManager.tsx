import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Download, FileText, FileSpreadsheet, FileJson, 
  Calendar, Filter, Settings, CheckCircle, Clock
} from 'lucide-react';

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dateRange: 'all' | '7d' | '30d' | '90d' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  includeHeaders: boolean;
  selectedFields: string[];
  compression: boolean;
}

interface ExportManagerProps {
  dataType: 'orders' | 'refills' | 'transfers' | 'contacts' | 'notifications' | 'analytics';
  availableFields: string[];
  onExport: (options: ExportOptions) => Promise<void>;
  isExporting: boolean;
}

const FORMAT_ICONS = {
  csv: FileText,
  excel: FileSpreadsheet,
  pdf: FileText,
  json: FileJson
};

const FORMAT_LABELS = {
  csv: 'CSV',
  excel: 'Excel',
  pdf: 'PDF',
  json: 'JSON'
};

const DATE_RANGE_LABELS = {
  all: 'All Time',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  custom: 'Custom Range'
};

export function ExportManager({ 
  dataType, 
  availableFields, 
  onExport, 
  isExporting 
}: ExportManagerProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: '30d',
    includeHeaders: true,
    selectedFields: availableFields,
    compression: false
  });

  const handleFieldToggle = (field: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedFields: prev.selectedFields.includes(field)
        ? prev.selectedFields.filter(f => f !== field)
        : [...prev.selectedFields, field]
    }));
  };

  const handleSelectAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedFields: availableFields
    }));
  };

  const handleDeselectAllFields = () => {
    setExportOptions(prev => ({
      ...prev,
      selectedFields: []
    }));
  };

  const handleExport = async () => {
    if (exportOptions.selectedFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }
    
    try {
      await onExport(exportOptions);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getDataTypeLabel = () => {
    const labels = {
      orders: 'Orders',
      refills: 'Refill Requests',
      transfers: 'Transfer Requests',
      contacts: 'Contact Requests',
      notifications: 'Notifications',
      analytics: 'Analytics Data'
    };
    return labels[dataType] || dataType;
  };

  const getEstimatedSize = () => {
    // Mock size estimation based on format and compression
    const baseSize = 100; // KB
    const formatMultiplier = {
      csv: 1,
      excel: 1.5,
      pdf: 2,
      json: 1.2
    };
    const compressionMultiplier = exportOptions.compression ? 0.6 : 1;
    return Math.round(baseSize * formatMultiplier[exportOptions.format] * compressionMultiplier);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowExportDialog(true)}
        className="text-brand hover:text-brand-dark"
      >
        <Download className="h-4 w-4 mr-2" />
        Export {getDataTypeLabel()}
      </Button>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export {getDataTypeLabel()}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Export Format</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(FORMAT_LABELS).map(([format, label]) => {
                  const IconComponent = FORMAT_ICONS[format as keyof typeof FORMAT_ICONS];
                  return (
                    <div
                      key={format}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        exportOptions.format === format
                          ? 'border-[#376F6B] bg-[#376F6B]/5 text-[#376F6B]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: format as any }))}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Date Range</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(DATE_RANGE_LABELS).map(([range, label]) => (
                  <div
                    key={range}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      exportOptions.dateRange === range
                        ? 'border-[#376F6B] bg-[#376F6B]/5 text-[#376F6B]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, dateRange: range as any }))}
                  >
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
              
              {exportOptions.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={exportOptions.customStartDate || ''}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        customStartDate: e.target.value 
                      }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#376F6B]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={exportOptions.customEndDate || ''}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        customEndDate: e.target.value 
                      }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#376F6B]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Field Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Fields to Export</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllFields}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAllFields}
                    className="text-xs"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableFields.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      checked={exportOptions.selectedFields.includes(field)}
                      onCheckedChange={() => handleFieldToggle(field)}
                      className="data-[state=checked]:bg-[#376F6B]"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Export Options</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                                      <Checkbox
                      checked={exportOptions.includeHeaders}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeHeaders: checked as boolean 
                      }))}
                      className="data-[state=checked]:bg-[#376F6B]"
                    />
                  <span className="text-sm text-gray-700">Include column headers</span>
                </div>
                <div className="flex items-center space-x-2">
                                      <Checkbox
                      checked={exportOptions.compression}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ 
                        ...prev, 
                        compression: checked as boolean 
                      }))}
                      className="data-[state=checked]:bg-[#376F6B]"
                    />
                  <span className="text-sm text-gray-700">Compress file (ZIP)</span>
                </div>
              </div>
            </div>

            {/* Export Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Export Summary</h4>
                    <p className="text-sm text-gray-600">
                      {getDataTypeLabel()} • {FORMAT_LABELS[exportOptions.format]} • {DATE_RANGE_LABELS[exportOptions.dateRange]}
                    </p>
                    <p className="text-sm text-gray-600">
                      {exportOptions.selectedFields.length} fields selected • ~{getEstimatedSize()} KB
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Ready to Export
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || exportOptions.selectedFields.length === 0}
                className="bg-[#376F6B] hover:bg-[#57BBB6]"
              >
                {isExporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 