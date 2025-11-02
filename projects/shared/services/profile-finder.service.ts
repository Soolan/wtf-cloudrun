import { inject, Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import {Profile, PublicProfile} from '@shared/interfaces';
import { PROFILES } from '@shared/constants';
import {FunctionsService} from '@shared/services/functions.service';

@Injectable({ providedIn: 'root' })
export class ProfileFinderService {
  private crud = inject(CrudService);
  private functions = inject(FunctionsService);

  async getUid(email: string): Promise<string | null> {
    try {
      const response = await this.functions.call('getUidByEmail', {email});
      return response.data.uid;
    } catch (error) {
      console.error('Error fetching uid:', error);
      return null;
    }
  }

  async getUser(uid: string): Promise<PublicProfile | null> {
    try {
      const doc: Profile = await this.crud.getDoc(PROFILES.path, uid);
      if (doc) {
        return {
          firstName: doc.firstname ?? '',
          lastName: doc.lastname ?? '',
          displayName: doc.display_name ?? '',
          avatar: doc.avatar ?? '',
          joinedAt: doc.timestamps.created_at
        };
      }
      return null;
    } catch (error) {
      console.error('[ProfileFinderService] Error fetching profile:', error);
      return null;
    }
  }
}
