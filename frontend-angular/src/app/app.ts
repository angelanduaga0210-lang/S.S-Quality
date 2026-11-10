import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  username: string = '';
  userRoles: string[] = [];
  backendUserMessage: string = '';
  backendAdminMessage: string = '';
  errorMessage: string = '';

  constructor(
    private keycloakService: KeycloakService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (await this.keycloakService.isLoggedIn()) {
      const profile = await this.keycloakService.loadUserProfile();
      this.username = profile.username || '';
      this.userRoles = this.keycloakService.getUserRoles();
      this.cdr.detectChanges();
    }
  }

  callUserEndpoint() {
    this.errorMessage = '';
    this.backendUserMessage = '';
    this.backendAdminMessage = '';
    this.http.get<{ message: string }>('http://localhost:8082/api/user').subscribe({
      next: (res) => {
        this.backendUserMessage = res.message || 'Respuesta recibida de /api/user';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error HTTP /api/user:', err);
        this.errorMessage = err.status === 0
          ? 'Error de conexión: Verifica que Spring Boot (puerto 8082) esté activo y tenga CORS habilitado'
          : `Error ${err.status}: Acceso denegado a /api/user`;
        this.cdr.detectChanges();
      }
    });
  }

  callAdminEndpoint() {
    this.errorMessage = '';
    this.backendUserMessage = '';
    this.backendAdminMessage = '';
    this.http.get<{ message: string }>('http://localhost:8082/api/admin').subscribe({
      next: (res) => {
        this.backendAdminMessage = res.message || 'Respuesta recibida de /api/admin';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error HTTP /api/admin:', err);
        this.errorMessage = err.status === 0
          ? 'Error de conexión: Verifica que Spring Boot (puerto 8082) esté activo y tenga CORS habilitado'
          : `Error ${err.status}: Acceso denegado a /api/admin (Requiere ROLE_ADMIN)`;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.keycloakService.logout('http://localhost:4200');
  }
}