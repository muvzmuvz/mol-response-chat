// register-page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth/auth';
import { FormsModule } from '@angular/forms';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-register-page',
  standalone: true, // Добавлено
  imports: [FormsModule, Navbar], // Исправлено
  templateUrl: './register-page.html',
  styleUrl: './register-page.less'
})
export class RegisterPage {
  username = '';
  password = '';
  message = '';

  constructor(private auth: AuthService, private router: Router) { }

  register() {
    this.auth.register(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => this.message = err.error.message || 'Ошибка регистрации',
    });
  }
}