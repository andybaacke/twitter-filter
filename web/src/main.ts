import 'core-js/es6';
import 'intl';
import 'intl/locale-data/jsonp/en.js';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

const platform = platformBrowserDynamic();

enableProdMode();
platform.bootstrapModule(AppModule); // then bootstrap the angular app
