import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export interface SnapshotOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number;
}

class SnapshotService {
  private defaultOptions: SnapshotOptions = {
    backgroundColor: '#ffffff',
    scale: 2,
  };

  async captureElement(element: HTMLElement, options: SnapshotOptions = {}): Promise<HTMLCanvasElement> {
    const config = { ...this.defaultOptions, ...options };
    
    // Wait for any pending renders
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return html2canvas(element, {
      backgroundColor: config.backgroundColor,
      scale: config.scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: config.width,
      height: config.height,
    });
  }

  async captureMapboxCanvas(mapContainer: HTMLElement): Promise<HTMLCanvasElement> {
    // Wait for map to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the Mapbox canvas element
    const mapCanvas = mapContainer.querySelector('canvas') as HTMLCanvasElement;
    
    if (!mapCanvas) {
      throw new Error('Mapbox canvas not found');
    }

    // Wait for any pending map operations
    await new Promise(resolve => setTimeout(resolve, 200));

    // Try to get canvas data URL directly from Mapbox
    try {
      const dataURL = mapCanvas.toDataURL('image/png');
      
      if (dataURL === 'data:,') {
        throw new Error('Canvas is blank or tainted');
      }

      // Create canvas from data URL
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      canvas.width = mapCanvas.width;
      canvas.height = mapCanvas.height;

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve(canvas);
        };
        img.onerror = reject;
        img.src = dataURL;
      });
    } catch (error) {
      console.error('Error capturing Mapbox canvas:', error);
      throw error;
    }
  }

  async downloadImage(element: HTMLElement, filename: string, options: SnapshotOptions = {}): Promise<void> {
    try {
      let canvas: HTMLCanvasElement;
      
      // Check if this is a Mapbox container
      if (element.querySelector('canvas')) {
        console.log('Capturing Mapbox canvas...');
        canvas = await this.captureMapboxCanvas(element);
      } else {
        console.log('Capturing regular element...');
        canvas = await this.captureElement(element, options);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          console.log('Downloading image...', filename);
          saveAs(blob, `${filename}.png`);
        } else {
          throw new Error('Failed to create blob from canvas');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    }
  }

  async downloadPDF(
    statsElement: HTMLElement,
    mapElement: HTMLElement,
    filename: string,
    options: SnapshotOptions = {}
  ): Promise<void> {
    try {
      console.log('Starting PDF generation...');
      
      // Capture both elements with better error handling
      const [statsCanvas, mapCanvas] = await Promise.all([
        this.captureElement(statsElement, options).catch(err => {
          console.error('Stats capture failed:', err);
          throw new Error('Failed to capture language insights');
        }),
        mapElement.querySelector('canvas') 
          ? this.captureMapboxCanvas(mapElement).catch(err => {
              console.error('Map capture failed:', err);
              throw new Error('Failed to capture map');
            })
          : this.captureElement(mapElement, options).catch(err => {
              console.error('Map element capture failed:', err);
              throw new Error('Failed to capture map element');
            })
      ]);

      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Language Insights Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add stats dashboard (top half)
      const statsImgData = statsCanvas.toDataURL('image/png');
      const statsAspectRatio = statsCanvas.width / statsCanvas.height;
      const statsWidth = pageWidth - 20;
      const statsHeight = statsWidth / statsAspectRatio;
      
      pdf.addImage(statsImgData, 'PNG', 10, 30, statsWidth, Math.min(statsHeight, 80));
      
      // Add map (bottom half)
      const mapImgData = mapCanvas.toDataURL('image/png');
      const mapAspectRatio = mapCanvas.width / mapCanvas.height;
      const mapWidth = pageWidth - 20;
      const mapHeight = mapWidth / mapAspectRatio;
      
      const mapY = 30 + Math.min(statsHeight, 80) + 10;
      pdf.addImage(mapImgData, 'PNG', 10, mapY, mapWidth, Math.min(mapHeight, pageHeight - mapY - 10));
      
      // Save PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error creating PDF:', error);
      throw error;
    }
  }

  async downloadComprehensivePDF(
    statsElement: HTMLElement,
    mapElement: HTMLElement,
    countryElement: HTMLElement,
    filename: string,
    options: SnapshotOptions = {}
  ): Promise<void> {
    try {
      console.log('Starting comprehensive PDF generation...');
      
      // Capture all elements
      const [statsCanvas, mapCanvas, countryCanvas] = await Promise.all([
        this.captureElement(statsElement, options).catch(err => {
          console.error('Enhanced stats capture failed:', err);
          throw new Error('Failed to capture enhanced language insights');
        }),
        mapElement.querySelector('canvas') 
          ? this.captureMapboxCanvas(mapElement).catch(err => {
              console.error('Map capture failed:', err);
              throw new Error('Failed to capture map');
            })
          : this.captureElement(mapElement, options).catch(err => {
              console.error('Map element capture failed:', err);
              throw new Error('Failed to capture map element');
            }),
        this.captureElement(countryElement, options).catch(err => {
          console.error('Country breakdown capture failed:', err);
          throw new Error('Failed to capture country breakdown');
        })
      ]);

      // Create PDF
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      
      // Page 1: Enhanced Language Insights
      pdf.setFontSize(20);
      pdf.text('Complete Language Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      const statsImgData = statsCanvas.toDataURL('image/png');
      const statsAspectRatio = statsCanvas.width / statsCanvas.height;
      const statsHeight = contentWidth / statsAspectRatio;
      
      pdf.addImage(statsImgData, 'PNG', margin, 30, contentWidth, Math.min(statsHeight, pageHeight - 50));
      
      // Page 2: Map Visualization
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Language Distribution Map', pageWidth / 2, 20, { align: 'center' });
      
      const mapImgData = mapCanvas.toDataURL('image/png');
      const mapAspectRatio = mapCanvas.width / mapCanvas.height;
      const mapHeight = contentWidth / mapAspectRatio;
      
      pdf.addImage(mapImgData, 'PNG', margin, 30, contentWidth, Math.min(mapHeight, pageHeight - 50));
      
      // Page 3: Country Breakdown
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Detailed Country Analysis', pageWidth / 2, 20, { align: 'center' });
      
      const countryImgData = countryCanvas.toDataURL('image/png');
      const countryAspectRatio = countryCanvas.width / countryCanvas.height;
      const countryHeight = contentWidth / countryAspectRatio;
      
      // If country breakdown is very long, fit to page height
      const maxCountryHeight = pageHeight - 50;
      if (countryHeight > maxCountryHeight) {
        const scaledWidth = contentWidth * (maxCountryHeight / countryHeight);
        pdf.addImage(countryImgData, 'PNG', (pageWidth - scaledWidth) / 2, 30, scaledWidth, maxCountryHeight);
      } else {
        pdf.addImage(countryImgData, 'PNG', margin, 30, contentWidth, countryHeight);
      }
      
      // Save PDF
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error creating comprehensive PDF:', error);
      throw error;
    }
  }

  generateFilename(selectedLanguages: string[]): string {
    const timestamp = new Date().toISOString().split('T')[0];
    if (selectedLanguages.length === 0) {
      return `language-insights-global-${timestamp}`;
    }
    
    // Use actual language names if available, otherwise use IDs
    const languageNames = selectedLanguages.slice(0, 3).map(id => {
      // Try to get language name from the DOM or use the ID
      const element = document.querySelector(`[data-language-id="${id}"]`);
      if (element) {
        return element.textContent?.toLowerCase().replace(/\s+/g, '-') || id;
      }
      return id;
    });
    
    const languageCode = languageNames.join('-');
    return `language-insights-${languageCode}-${timestamp}`;
  }
}

export const snapshotService = new SnapshotService();