import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { snapshotService } from '@/services/snapshotService';
import { useToast } from '@/hooks/use-toast';

interface SnapshotControlsProps {
  statsRef: React.RefObject<HTMLDivElement>;
  mapRef: React.RefObject<HTMLDivElement>;
  selectedLanguages: string[];
}

const SnapshotControls: React.FC<SnapshotControlsProps> = ({
  statsRef,
  mapRef,
  selectedLanguages
}) => {
  const { t } = useTranslation(['common']);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleDownloadImage = async (type: 'stats' | 'map') => {
    if (!statsRef.current || !mapRef.current) {
      toast({
        title: t('common:error'),
        description: 'Components not ready for capture',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(type);
    try {
      const element = type === 'stats' ? statsRef.current : mapRef.current;
      const filename = `${snapshotService.generateFilename(selectedLanguages)}-${type}`;
      
      await snapshotService.downloadImage(element, filename);
      
      toast({
        title: 'Success',
        description: `${type === 'stats' ? 'Language insights' : 'Map'} image downloaded`,
      });
    } catch (error) {
      toast({
        title: t('common:error'),
        description: 'Failed to download image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!statsRef.current || !mapRef.current) {
      toast({
        title: t('common:error'),
        description: 'Components not ready for capture',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading('pdf');
    try {
      const filename = snapshotService.generateFilename(selectedLanguages);
      await snapshotService.downloadPDF(statsRef.current, mapRef.current, filename);
      
      toast({
        title: 'Success',
        description: 'PDF report downloaded',
      });
    } catch (error) {
      toast({
        title: t('common:error'),
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const hasSelectedLanguages = selectedLanguages.length > 0;

  return (
    <Card className="shadow-card-custom">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Export Data</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadImage('stats')}
            disabled={!hasSelectedLanguages || isLoading === 'stats'}
            className="flex items-center gap-1"
          >
            {isLoading === 'stats' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <FileImage className="w-3 h-3" />
            )}
            <span className="text-xs">Insights PNG</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadImage('map')}
            disabled={!hasSelectedLanguages || isLoading === 'map'}
            className="flex items-center gap-1"
          >
            {isLoading === 'map' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <FileImage className="w-3 h-3" />
            )}
            <span className="text-xs">Map PNG</span>
          </Button>
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={!hasSelectedLanguages || isLoading === 'pdf'}
          className="w-full mt-2 flex items-center gap-1"
        >
          {isLoading === 'pdf' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <FileText className="w-3 h-3" />
          )}
          <span className="text-xs">Full Report PDF</span>
        </Button>
        
        {!hasSelectedLanguages && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Select languages to enable exports
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SnapshotControls;