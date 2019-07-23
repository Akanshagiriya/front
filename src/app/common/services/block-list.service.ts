import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { Client } from "../../services/api/client";
import { Session } from "../../services/session";
import { Storage } from '../../services/storage';

import AsyncLock from "../../helpers/async-lock";

import MindsClientHttpAdapter from "../../lib/minds-sync/adapters/MindsClientHttpAdapter.js";
import browserStorageAdapterFactory from "../../helpers/browser-storage-adapter-factory";
import BlockListSync from "../../lib/minds-sync/services/BlockListSync.js";
import AsyncStatus from "../../helpers/async-status";

@Injectable()
export class BlockListService {

  blocked: BehaviorSubject<string[]>;

  constructor(
    protected client: Client,
    protected session: Session,
    protected storage: Storage
  ) {
    this.blocked = new BehaviorSubject(JSON.parse(this.storage.get('blocked')));
    this.fetch();
  }

  fetch() {
    this.client.get('api/v1/block', { sync: 1, limit: 10000 })
      .then((response: any) => {
        if (response.guids !== this.blocked.getValue())
          this.blocked.next(response.guids); // re-emit as we have a change

        this.storage.set('blocked', JSON.stringify(response.guids)); // save to storage
      });
    return this;
  }

  async sync() {
  }

  async prune() {
  }

  async get() {
  }

  async getList() {
    return this.blocked.getValue();
  }

  async add(guid: string) {
    const guids = this.blocked.getValue();
    if (guids.indexOf(guid) < 0)
      this.blocked.next([...guids, ...[ guid ]]);
    this.storage.set('blocked', JSON.stringify(this.blocked.getValue()));
  }

  async remove(guid: string) {
    const guids = this.blocked.getValue();
    const index = guids.indexOf(guid);
    if (index > -1) {
      guids.splice(index, 1);
    }

    this.blocked.next(guids);
    this.storage.set('blocked', JSON.stringify(this.blocked.getValue()));
  }

  static _(client: Client, session: Session, storage: Storage) {
    return new BlockListService(client, session, storage);
  }
}
