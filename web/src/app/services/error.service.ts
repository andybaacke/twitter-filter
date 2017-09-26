import { Inject } from '@angular/core';
import { ModalService } from './modal.service';

export class ErrorService {
  constructor (@Inject(ModalService) private _modalService: ModalService) {}

  console (type: string, message: any) {
    console[type](message);
  }

  alert (message?: any) {
    this._modalService.open(message);
  }
}
