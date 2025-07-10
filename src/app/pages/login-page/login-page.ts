import { Component } from '@angular/core';
import { AuthService } from '../../service/auth/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, Navbar],
  templateUrl: './login-page.html',
  styleUrl: './login-page.less'
})
export class LoginPage {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) { }

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: (tokens) => {
        this.auth.saveTokens(tokens.access_token, tokens.refresh_token);
        this.router.navigate(['/chat']);
      },
      error: err => this.error = err.error.message || 'Ошибка входа',
    });
  }
}

