import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ErrorService } from '../services/error.service';

import { DatePipe } from '@angular/common';
import { FilterByPipe } from 'ng-pipes/src/collection/filter-by.pipe';

@Component({
  selector: 'results', // tslint:disable-line:component-selector
  templateUrl: 'app/results/results.component.html',
  providers: [
    DatePipe,
    FilterByPipe
  ]
})
export class ResultsComponent {
  tweets: Array<object> = [];
  tweetFilter: string;
  noResultsReason: string;

  constructor (private _apiService: ApiService,
               private _errorService: ErrorService) {
    this.refreshResults();
  }

  refreshResults () {
    this.noResultsReason = 'Loading. Please wait.';
    this.tweets = []; // clear any existing tweets

    this._apiService.getTweets() // then get new ones
    .subscribe(
      (successResponseTweets) => {
        if (successResponseTweets.length) {
          this.tweets = successResponseTweets;
        } else {
          this.noResultsReason = 'No results.';
        }
      },
      (errorResponse) => {
        this.noResultsReason = 'An error has occurred. Please try again later';
        this._errorService.console('error', `Error refreshing tweets: ${errorResponse}`);
      },
      () => setTimeout(function(){ // wait for digest
        const filterInput = document.getElementById('filter');

        if (filterInput) {
          filterInput.focus(); // then focus on input
        }
      }, 0));
  }
}
