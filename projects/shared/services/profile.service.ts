import {inject, Injectable, signal} from '@angular/core';
import { CrudService } from '@shared/services/crud.service';
import {Balance, CurrentPlan, Entity, Profile, ProfileWithId, Subscription} from '@shared/interfaces';
import { PROFILES, PROFILE } from '@shared/constants';
import { User } from 'firebase/auth';
import {StorageUrlPipe} from '@shared/pipes';
import {firstValueFrom} from 'rxjs';
import {FunctionsService} from '@shared/services/functions.service';
import {user} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private functions = inject(FunctionsService);
  private storageUrl = inject(StorageUrlPipe);
  private crud = inject(CrudService);

  avatar = signal<string>('');
  isSocial = signal<boolean>(false);
  profileWithId = signal<ProfileWithId | null>(null);
  profileId = signal<string>('');
  profile = signal<Profile | null>(null);
  displayName = signal<string>('');
  entity = signal<Entity | null>(null);
  currentPlan = signal<CurrentPlan | null>(null);
  tag = signal<number>(0);
  balances = signal<Balance[]>([]);

  async initProfile(user: User | null): Promise<void> {
    if (!user?.uid) return;
    this.profileId.set(user.uid);
    const profileData = await this.crud.getDoc(PROFILES.path, user.uid, true) as Profile;
    if (!profileData) return;
    const profileWithId = { id: user.uid, ...profileData };
    this.profile.set(profileData);
    this.profileWithId.set(profileWithId);
    this.displayName.set(profileData.display_name || user.displayName || user.email || '');
    this.currentPlan.set(profileData.currentPlan);
    this.tag.set(profileData.tag);
    this.balances.set(profileData.balances || [])

    if (profileData.avatar) {
      await this.setAvatar(profileData.avatar);
    } else {
      this.avatar.set('');
      this.isSocial.set(false);
    }

    this.entity.set({
      role: this.profileId(),
      name: this.displayName(),
      avatar: this.avatar()
    });
  }

  private async setAvatar(avatar: string) {
    try {
      const url = await firstValueFrom(this.storageUrl.transform(avatar));
      this.avatar.set(url || '');
      this.isSocial.set(!!url?.startsWith('http'));
    } catch (error) {
      console.error('Error fetching avatar URL:', error);
      this.avatar.set('');
      this.isSocial.set(false);
    }
  }

  async setProfile(user: User, name: string): Promise<{success: boolean, message: string, tag: number} | null> {
    const profile = this.getDTO(user, name);
    this.profileId.set(user.uid);
    await this.crud.set(PROFILES.path, user.uid, profile);
    const profileWithId = { id: user.uid, ...profile };
    return await this.functions.call('setProfileTag', profileWithId);
  }

  updateAvatar(uid: string, avatar: string) {
    return this.crud.update(PROFILES.path, uid, avatar);
  }

  private getDTO(user: User, name: string): Profile {
    return {
      ...PROFILE,
      avatar: user.photoURL || '',
      display_name: name
    };
  }

  get avatarUrl(): string {
    return `url(${this.isSocial() ? this.avatar() : ''})`;
  }
}

