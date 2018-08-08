import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MtgSimpleSet } from '../../model/SimpleSet';
import { MtgSet } from '../../model/Set';
import { Observable } from 'rxjs/Observable';

export const SIMPLE_SET_LIST_API = 'https://mtgjson.com/json/SetList.json'

@Injectable()
export class SetsProvider {

  constructor(public http: HttpClient) {
  }

  getSimpleSetList(): Observable<Array<MtgSimpleSet>> {
    return this.http.get<Array<MtgSimpleSet>>(SIMPLE_SET_LIST_API);
  }

  getSet(code: string): Observable<MtgSet> {
    const url = `https://mtgjson.com/json/${code}.json`;
    return this.http.get<MtgSet>(url);
  }

}
