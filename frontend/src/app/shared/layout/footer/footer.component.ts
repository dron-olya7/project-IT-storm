import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RequestsService } from '../../services/requests.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit{

  @ViewChild('popup') popup: TemplateRef<ElementRef> | undefined;
  @ViewChild('popupThanks') popupThanks: TemplateRef<ElementRef>| undefined;

  footerForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[А-Я][а-я]+$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
  });

  dialogRef: MatDialogRef<any> | null = null;
  dialogRefThanks: MatDialogRef<any> | null = null;
  constructor(private dialog: MatDialog,
              private fb: FormBuilder,
              private requestsService: RequestsService) {
  }

  ngOnInit() {

  }

  openPopup() {
    this.footerForm.markAsUntouched();

    this.footerForm.setValue({
      name: '',
      phone: '',
    });

    // Добавляем проверку на undefined
    if (this.popup) {
      this.dialogRef = this.dialog.open(this.popup);
    }
  }

  closePopup(popup: string) {
    if (popup === 'popup') this.dialogRef?.close();
    else if (popup === 'popupThanks') this.dialogRefThanks?.close();
  }

  leaveInfo() {
    if (this.footerForm.valid) {
      this.dialogRef?.close();

      // Добавляем проверку на undefined
      if (this.popupThanks) {
        this.dialogRefThanks = this.dialog.open(this.popupThanks);
      }

      if (this.footerForm.value.name && this.footerForm.value.phone) {
        this.requestsService.sendRequest(this.footerForm.value.name, this.footerForm.value.phone.toString(), 'consultation');
      }
    }
  }
}
