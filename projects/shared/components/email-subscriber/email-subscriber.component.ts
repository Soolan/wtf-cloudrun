import { Component, inject, signal } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatFormFieldModule, MatHint, MatLabel, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatInput, MatInputModule} from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgIf } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {CrudService} from '@shared/services';
import {WtfQuery} from '@shared/interfaces';
import {SUBSCRIBERS} from '@shared/constants';

@Component({
  selector: 'lib-email-subscriber',
  templateUrl: './email-subscriber.component.html',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatPrefix,
    MatSuffix,
    MatIcon,
    NgIf,
    MatHint
  ],
  styleUrls: ['./email-subscriber.component.scss']
})
export class EmailSubscriberComponent {
  private crud = inject(CrudService);
  private snackbar = inject(MatSnackBar);

  private readonly emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,4}$/;

  emailControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(this.emailRegex)]
  });

  clicked = signal(false);

  constructor() {
    this.emailControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.clicked.set(false);
    });
  }

  reset(): void {
    this.emailControl.setValue('');
    this.clicked.set(false);
  }

  async checkEmail(): Promise<void> {
    this.clicked.set(true);
    this.emailControl.updateValueAndValidity();

    if (this.emailControl.invalid) {
      this.snackbar.open('Invalid email!', 'X', { duration: 3000 });
      this.reset();
      return;
    }

    const query: WtfQuery = {
      ...SUBSCRIBERS,
      where: { field: 'email', operator: '==', value: this.emailControl.value },
      limit: 1
    };

    try {
      const docs = await this.crud.getDocs(query, true, true);
      if (docs?.length) {
        this.snackbar.open('You are already subscribed!', 'X', { duration: 3000 });
      } else {
        await this.join();
      }
    } catch (error) {
      this.snackbar.open('Failed to check subscription status.', 'X', { duration: 5000 });
    } finally {
      this.reset();
    }
  }

  async join(): Promise<void> {
    try {
      await this.crud.add(SUBSCRIBERS.path, { email: this.emailControl.value, name: '', settings: [] });
      this.snackbar.open('Subscribed Successfully!', 'X', { duration: 3000 });
    } catch (error) {
      this.snackbar.open(`Error: ${error}`, 'X', { duration: 7000 });
    } finally {
      this.reset();
    }
  }
}

