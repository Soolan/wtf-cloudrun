import {Injectable, signal} from '@angular/core';
import {CrudService} from '@shared/services';
import {Entity, PlaybookStats, Topic, TopicWithId, WtfQuery} from '@shared/interfaces';
import {DocumentReference} from '@angular/fire/firestore';
import {GENERAL_POLICIES_TOPIC, NEW_STATS, STATS_COLLECTION, STATS_DOC} from '@shared/constants';

@Injectable({
  providedIn: 'root'
})
export class PlaybookService {
  topic = signal<TopicWithId | null>(null);
  department = signal<string | null>(null);
  order = signal<number | null>(null);
  stats = signal<PlaybookStats | null>(null);

  constructor(private crud: CrudService) { }

  async setDefaultPlaybook(path: string, creator: Entity): Promise<DocumentReference | null> {
    await this.crud.add(path, NEW_STATS);
    const data: Topic = {...GENERAL_POLICIES_TOPIC, creator};
    return this.crud.add(path, data);
  }

  async updateStats(path: string, stats: PlaybookStats) {
    this.stats.set(stats);
    console.log(stats, this.stats())
    await this.crud.update(path, STATS_DOC, stats);
  }

  count(q: WtfQuery): Promise<number> {
    return this.crud.countQuery(q);
  }

  private setTopic(snapshot: TopicWithId | null): void {
    this.topic.set(snapshot);
  }

  private setDepartment(snapshot: string | null): void {
    this.department.set(snapshot);
  }

  setOrder(snapshot: number | null): void {
    this.order.set(snapshot);
  }
}
