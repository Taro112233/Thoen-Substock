// app/admin/personnel-types/components/PersonnelTypeImportDialog.tsx
// Personnel Types - Import Dialog Component
// Dialog สำหรับนำเข้าข้อมูลประเภทบุคลากร

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Info
} from 'lucide-react';

interface PersonnelTypeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImportResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  warnings: number;
  created?: number;
  updated?: number;
  errors?: number;
}

export function PersonnelTypeImportDialog({
  open,
  onOpenChange,
  onSuccess
}: PersonnelTypeImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'validate' | 'import'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [skipInvalid, setSkipInvalid] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json')) {
        setFile(selectedFile);
        parseFile(selectedFile);
      } else {
        toast.error('กรุณาเลือกไฟล์ JSON เท่านั้น');
      }
    }
  };

  const parseFile = async (file: File) => {
    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (Array.isArray(data)) {
        setImportData(data);
        setMode('validate');
      } else if (data.templates && Array.isArray(data.templates)) {
        setImportData(data.templates);
        setMode('validate');
      } else {
        toast.error('รูปแบบไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์เทมเพลตที่ดาวน์โหลดจากระบบ');
      }
    } catch (error) {
      toast.error('ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบรูปแบบไฟล์');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setLoading(true);
      setProgress(25);

      const response = await fetch('/api/admin/personnel-types/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: importData,
          options: {
            mode: 'validate',
            updateExisting,
            skipInvalid,
            validateOnly: true
          }
        }),
      });

      setProgress(75);
      const result = await response.json();
      setProgress(100);

      if (result.success) {
        setValidationResult(result.validation);
        setMode('import');
        toast.success('ตรวจสอบข้อมูลเรียบร้อยแล้ว');
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล');
      }
    } catch (error) {
      console.error('Error validating import:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setProgress(25);

      const response = await fetch('/api/admin/personnel-types/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: importData,
          options: {
            mode: 'import',
            updateExisting,
            skipInvalid,
            validateOnly: false
          }
        }),
      });

      setProgress(75);
      const result = await response.json();
      setProgress(100);

      if (result.success) {
        setImportResult(result.result);
        toast.success(result.message || 'นำเข้าข้อมูลเรียบร้อยแล้ว');
        onSuccess();
      } else {
        toast.error(result.error || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/personnel-types/import?mode=template');
      const result = await response.json();

      if (result.success) {
        // Create and download template file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `personnel-types-template-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        toast.success('ดาวน์โหลดเทมเพลตเรียบร้อยแล้ว');
      } else {
        toast.error('เกิดข้อผิดพลาดในการดาวน์โหลดเทมเพลต');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMode('upload');
      setFile(null);
      setImportData([]);
      setValidationResult(null);
      setImportResult(null);
      setUpdateExisting(false);
      setSkipInvalid(false);
      setProgress(0);
      onOpenChange(false);
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">นำเข้าข้อมูลประเภทบุคลากร</h3>
        <p className="text-gray-600 mb-4">
          เลือกไฟล์ JSON ที่ต้องการนำเข้า หรือดาวน์โหลดเทมเพลตเพื่อเริ่มต้น
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="block mb-2">เลือกไฟล์ JSON</Label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">หรือ</p>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลดเทมเพลต
          </Button>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">คำแนะนำการใช้งาน:</p>
            <ul className="text-sm space-y-1">
              <li>• ดาวน์โหลดเทมเพลตและแก้ไขข้อมูลตามต้องการ</li>
              <li>• รหัสประเภท (typeCode) ต้องไม่ซ้ำกันในระบบ</li>
              <li>• ระดับลำดับชั้น (hierarchy) ต้องเป็นค่าที่ระบบรองรับ</li>
              <li>• สิทธิ์ต่างๆ ใช้ค่า true/false</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderValidateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">ตรวจสอบข้อมูล</h3>
        <p className="text-gray-600">
          พบข้อมูล {importData.length} รายการ กรุณาตรวจสอบการตั้งค่าก่อนดำเนินการ
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="updateExisting"
            checked={updateExisting}
            onCheckedChange={(checked) => setUpdateExisting(!!checked)}
          />
          <Label htmlFor="updateExisting">อัพเดทข้อมูลที่มีอยู่แล้ว</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="skipInvalid"
            checked={skipInvalid}
            onCheckedChange={(checked) => setSkipInvalid(!!checked)}
          />
          <Label htmlFor="skipInvalid">ข้ามข้อมูลที่ไม่ถูกต้อง</Label>
        </div>
      </div>

      {progress > 0 && (
        <div className="space-y-2">
          <Label>กำลังตรวจสอบข้อมูล...</Label>
          <Progress value={progress} />
        </div>
      )}
    </div>
  );

  const renderImportStep = () => (
    <div className="space-y-6">
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>ผลการตรวจสอบ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{validationResult.totalRows}</p>
                <p className="text-sm text-gray-600">ทั้งหมด</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{validationResult.validRows}</p>
                <p className="text-sm text-gray-600">ถูกต้อง</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{validationResult.invalidRows}</p>
                <p className="text-sm text-gray-600">ไม่ถูกต้อง</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{validationResult.duplicates}</p>
                <p className="text-sm text-gray-600">ซ้ำ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {validationResult && validationResult.validRows > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            พร้อมนำเข้าข้อมูล {validationResult.validRows} รายการ
          </AlertDescription>
        </Alert>
      )}

      {validationResult && validationResult.invalidRows > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            พบข้อมูลที่ไม่ถูกต้อง {validationResult.invalidRows} รายการ
            {!skipInvalid && ' กรุณาแก้ไขหรือเลือก "ข้ามข้อมูลที่ไม่ถูกต้อง"'}
          </AlertDescription>
        </Alert>
      )}

      {progress > 0 && (
        <div className="space-y-2">
          <Label>กำลังนำเข้าข้อมูล...</Label>
          <Progress value={progress} />
        </div>
      )}

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>ผลการนำเข้า</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{importResult.created || 0}</p>
                <p className="text-sm text-gray-600">สร้างใหม่</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{importResult.updated || 0}</p>
                <p className="text-sm text-gray-600">อัพเดท</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{importResult.errors || 0}</p>
                <p className="text-sm text-gray-600">ข้อผิดพลาด</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <span>นำเข้าข้อมูลประเภทบุคลากร</span>
          </DialogTitle>
          <DialogDescription>
            นำเข้าข้อมูลประเภทบุคลากรจากไฟล์ JSON
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {mode === 'upload' && renderUploadStep()}
          {mode === 'validate' && renderValidateStep()}
          {mode === 'import' && renderImportStep()}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            {importResult ? 'ปิด' : 'ยกเลิก'}
          </Button>
          
          {mode === 'validate' && (
            <Button
              onClick={handleValidate}
              disabled={loading || importData.length === 0}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              ตรวจสอบข้อมูล
            </Button>
          )}
          
          {mode === 'import' && !importResult && validationResult && (
            <Button
              onClick={handleImport}
              disabled={loading || (validationResult.invalidRows > 0 && !skipInvalid)}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              นำเข้าข้อมูล
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}