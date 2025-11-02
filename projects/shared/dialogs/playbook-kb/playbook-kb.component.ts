import {Component, inject, OnInit, signal} from '@angular/core';
import {CompanyService, CrudService, FunctionsService} from '@shared/services';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {KbChunkWithId, KnowledgeBaseWithId, WtfQuery} from '@shared/interfaces';
import {KB_CHUNKS, KNOWLEDGE_BASES, PLAYBOOK_TOPICS} from '@shared/constants';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'lib-playbook-kb',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatIcon,
    MatIconButton,
    MatProgressBar,
    MatTooltip,
  ],
  templateUrl: './playbook-kb.component.html',
  standalone: true,
  styleUrl: './playbook-kb.component.scss'
})
export class PlaybookKbComponent implements OnInit{
  private crud = inject(CrudService);
  private snackBar = inject(MatSnackBar);
  private functions = inject(FunctionsService);
  private companyService = inject(CompanyService);
  private dialogRef = inject(MatDialogRef<PlaybookKbComponent>);
  protected data = inject(MAT_DIALOG_DATA) as { id: string, regenerate: boolean };

  working = signal<boolean>(false);
  message = signal<string>('AI Knowledge base');
  success = signal<boolean>(false);

  kb!: KnowledgeBaseWithId;
  chunks!: KbChunkWithId[];
  companyPath!: string;
  topicPath!: string;
  kbPath!: string;
  chunkPath!: string;

  async ngOnInit() {
    this.companyPath = `${this.companyService.path()}/${this.companyService.id()}`;
    this.topicPath = `${this.companyPath}/${PLAYBOOK_TOPICS.path}`;
    this.kbPath = `${this.companyPath}/${KNOWLEDGE_BASES.path}`;
    this.chunkPath = `${this.kbPath}/${this.data.id}/${KB_CHUNKS.path}`;
    this.kb = await this.crud.getDoc(this.kbPath, this.data.id);
    const q: WtfQuery = {...KB_CHUNKS};
    q.path = this.chunkPath;
    this.chunks = await this.crud.getDocs(q, true, true, false) as KbChunkWithId[];
  }

  async delete() {
    // Delete the kb and its chunks
    const refs = await this.crud.getDocRefs(this.chunkPath);
    await this.crud.deleteAllRefs(refs);
    this.crud.delete(this.kbPath, this.data.id);

    // remove the kb reference from topic
    await this.crud.update(this.topicPath, this.data.id, {kbId: ''});
  }

  async generate() {
    this.working.set(true);
    try {
      const payload = {
        companyPath: this.companyPath,
        topicId: this.data.id,
        regenerate: this.data.regenerate
      };
      const response = await this.functions.call('genKbChunksFlow', payload);
      if (response) {
        console.log(response);
        const {success, message} = response;
        this.message.set(message);
        this.success.set(success);
        this.dialogRef.close();
      }
    } catch (error: any) {
      // handle callable function errors here
      this.message.set(error?.details?.message || error?.message || 'Chunking failed');
      this.success.set(false);
    } finally {
      this.working.set(false);
    }
  }
}
