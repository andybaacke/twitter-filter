import { Inject } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ErrorService } from './error.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

export class ApiService {
  apiGatewayUrl: string;

  constructor (@Inject(ErrorService) private _errorService: ErrorService,
               @Inject(Http) private _http: Http) {
    this.apiGatewayUrl = 'https://ye5gfq5qg8.execute-api.us-east-2.amazonaws.com/twitter_filter';
  }

  getTweets (): Observable<any> {
    return this._http.get(this.apiGatewayUrl)
      .map((successResponse: Response) => successResponse.json())
      .catch((errorResponse: any) => Observable.throw(errorResponse));
  }
}
