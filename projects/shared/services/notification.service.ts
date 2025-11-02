import {Injectable} from '@angular/core';
import {CrudService} from '@shared/services/crud.service';
import {EmailNotification, InAppNotification} from '@shared/interfaces';
import {EMAIL_NOTIFICATIONS, MAILING_LISTS_COLLECTION, MAILING_LISTS_DAY1_DOC} from '@shared/constants';
import {KeyValue} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private crud: CrudService) { }

  async notify(notification: EmailNotification | InAppNotification, path?: string): Promise<any> {
    // Is this an email notification or in app notification?
    const collection = path ?? EMAIL_NOTIFICATIONS.path;
    return await this.crud.add(collection, notification);
  }

  async addToDayOneMailingList(data: KeyValue<string, string>): Promise<void> {
    await this.crud.updateAppend(MAILING_LISTS_COLLECTION, MAILING_LISTS_DAY1_DOC, data);
  }
}
