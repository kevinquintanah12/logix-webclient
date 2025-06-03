import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccessService } from 'src/app/services/access.service';
import { CryptographyService } from 'src/app/services/cryptography.service';
import { DatabaseService } from 'src/app/services/database.service';
import { LoaderService } from 'src/app/services/loader.service';
import { LoggerService } from 'src/app/services/logger.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class LoginComponent {

  protected showPassword: boolean = environment.conditionFalse;
  protected disableButton: boolean = environment.conditionFalse;

  constructor(
    private databaseService: DatabaseService,
    private loaderService: LoaderService,
    private formBuilder: FormBuilder,
    private accessService: AccessService,
    private router: Router,
    private cryptographyService: CryptographyService
  ) {}

  protected togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  protected loginForm: FormGroup = this.formBuilder.group({
    email: ['', [
      Validators.required,
      Validators.email,
      Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$")
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]]
  });

  protected addLogin(): void {
    this.disableButton = true;
    this.loaderService.setLoader(true);

    const email = (this.loginForm.get('email')?.value || '').toLowerCase();
    const password = this.loginForm.get('password')?.value;

    if (this.loginForm.invalid) {
      alert("Enter all fields");
      this.disableButton = false;
      this.loaderService.setLoader(false);
      return;
    }

    this.databaseService.getUser(email).subscribe(adddata => {
      if (!adddata) {
        this.loaderService.setLoader(false);
        this.disableButton = false;
        if (confirm("No user found! Please sign up.")) {
          LoggerService.info(`No user found with email ${email}, redirecting to signup.`);
          this.router.navigate(['signup'], { replaceUrl: true });
        }
        return;
      }

      const user = JSON.parse(JSON.stringify(adddata));

      if (user.block) {
        alert("You are blocked");
        LoggerService.info(`Login attempt for blocked user ${email}`);
      } else if (this.cryptographyService.decryption(user.password) !== password) {
        alert("Email or password incorrect");
        LoggerService.info(`Incorrect credentials for ${email}`);
      } else {
        // Login exitoso: cargamos datos y redirigimos siempre a /landing
        const sessionData = {
          name: user.name,
          email: user.email,
          role: user.role
        };
        this.accessService.loadData(sessionData);
        localStorage.setItem("llt-userdata", JSON.stringify(sessionData));
        localStorage.setItem("llt-date", new Date().getDate().toString());

        LoggerService.info(`Logged in successfully, redirecting to Landing`);
        this.router.navigate(['/'], { replaceUrl: true });
      }

      this.disableButton = false;
      this.loaderService.setLoader(false);
    });
  }

}
