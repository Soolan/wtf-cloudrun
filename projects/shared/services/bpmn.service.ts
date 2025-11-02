import {inject, Injectable} from '@angular/core';
import {StorageService} from '@shared/services/storage.service';
import {Canvas} from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import Modeler from 'bpmn-js/lib/Modeler';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class BpmnService {
  private storageService = inject(StorageService);
  private snackBar = inject(MatSnackBar);

  constructor() {
  }

  removeBranding() {
    const branding = document.querySelector('.bjs-powered-by');
    if (branding) branding.remove();
  }

  async loadRef(path: string): Promise<string> {
    if (!path) return '';
    try {
      const fileRef = this.storageService.getRef(path);
      const url = await this.storageService.getLink(fileRef);
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error('Error loading BPMN file:', error);
      return '';
    }
  }

  render(bpmn: Modeler, xml: string): void {
    if (!xml) return;
    bpmn.importXML(xml).then(
      ({warnings}) => {
        if (warnings.length) console.warn('Warnings:', warnings);
        setTimeout(() => {
          const canvas = bpmn.get<Canvas>('canvas');
          canvas?.zoom('fit-viewport');
        });
      },
      (err) => console.error('Error importing BPMN XML:', err)
    );
  }

  async saveXML(bpmn: Modeler, path: string): Promise<void> {
    try {
      const result = await bpmn.saveXML({format: true});
      const xml = result.xml;
      if (!xml) {
        this.snackBar.open('XML content is undefined; save operation aborted.', 'X', {duration: 4000});
        return;
      }
      const file = new Blob([xml], {type: 'text/xml'});
      const fileRef = this.storageService.getRef(path);
      await this.storageService.upload(fileRef, file);
      this.snackBar.open('File saved successfully', 'X', {duration: 4000});
    } catch (error) {
      console.error('Error saving XML:', error);
      this.snackBar.open('Error saving XML.', 'X', {duration: 4000});
    }
  }

  loadXML(bpmn: Modeler): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bpmn, .xml';
    input.style.display = 'none';

    input.addEventListener('change', async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const xml = reader.result as string;
          try {
            await bpmn.importXML(xml);
            this.snackBar.open('File loaded successfully', 'X', {duration: 4000});
          } catch (error) {
            console.error('Error loading BPMN file:', error);
            this.snackBar.open('Failed to load BPMN file', 'X', {duration: 4000});
          }
        };
        reader.readAsText(file);
      }
    });

    document.body.appendChild(input); // Ensure it's in the DOM before clicking
    input.click();
    document.body.removeChild(input); // Remove after click to keep DOM clean
  }

  async downloadXML(bpmn: Modeler): Promise<void> {
    try {
      const { xml } = await bpmn.saveXML({ format: true });
      if (!xml) {
        this.snackBar.open('Failed to generate XML file', 'X', { duration: 4000 });
        return;
      }
      this.downloadFile(xml, `${this.getProcessName(xml)}.bpmn`, 'text/xml');
      this.snackBar.open('Diagram downloaded successfully', 'X', { duration: 4000 });
    } catch (error) {
      console.error('Error downloading XML:', error);
      this.snackBar.open('Failed to download XML file', 'X', { duration: 4000 });
    }
  }

  async downloadSVG(bpmn: Modeler): Promise<void> {
    try {
      const { svg } = await bpmn.saveSVG();
      this.downloadFile(svg, 'diagram.svg', 'image/svg+xml');
      this.snackBar.open('Image saved successfully', 'X', { duration: 4000 });
    } catch (error) {
      console.error('Error saving image:', error);
      this.snackBar.open('Failed to save image', 'X', { duration: 4000 });
    }
  }

  private downloadFile(content: string, fileName: string, type: string): void {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getProcessName(xml: string): string {
      const match = xml.match(/<bpmn:process[^>]*name="([^"]+)"/);
      return match ? match[1] : `diagram-${Date.now()}`;
    }
}
