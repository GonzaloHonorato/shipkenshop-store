import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  // ===================================
  // DEPENDENCY INJECTION
  // ===================================
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // ===================================
  // REACTIVE STATE
  // ===================================
  public isLoading = signal(false);
  public showSuccess = signal(false);
  public showError = signal(false);
  public successMessage = signal('');
  public errorMessage = signal('');

  // ===================================
  // FORM SETUP
  // ===================================
  public forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // ===================================
  // FORM HANDLERS
  // ===================================

  /**
   * Maneja el envío del formulario de recuperación de contraseña
   */
  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value?.trim();
    if (!email) return;

    this.hideMessages();
    this.isLoading.set(true);

    try {
      // Simular delay de API
      await this.delay(1500);

      // Verificar si el email existe
      const users = this.dataService.users();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        // Generar token de recuperación
        const resetToken = this.generateResetToken();
        
        // Guardar datos de reset (válido por 1 hora)
        const resetData = {
          email: user.email,
          token: resetToken,
          expires: Date.now() + (60 * 60 * 1000) // 1 hora
        };

        localStorage.setItem('passwordReset', JSON.stringify(resetData));

        // Mostrar mensaje de éxito
        this.showSuccessMessage(`Se han enviado las instrucciones de recuperación a ${email}. Revisa tu correo electrónico.`);

        // En demo, mostrar info en consola
        console.log('🔑 TOKEN DE RECUPERACIÓN (Demo):');
        console.log(`Token: ${resetToken}`);
        console.log(`Válido hasta: ${new Date(resetData.expires).toLocaleString()}`);
        console.log(`En producción, esto se enviaría por email a: ${email}`);

        // Limpiar formulario
        this.forgotPasswordForm.reset();

        // Mostrar notificación
        this.notificationService.success('Instrucciones enviadas correctamente');

        // Redirigir a login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
        
      } else {
        // Por seguridad, mostrar el mismo mensaje aunque el email no exista
        // Esto previene enumeración de usuarios
        this.showSuccessMessage(`Si el correo ${email} está registrado, recibirás instrucciones para recuperar tu contraseña.`);

        this.notificationService.info('Revisa tu email si la cuenta existe');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }

    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      this.showErrorMessage('Ha ocurrido un error. Inténtalo de nuevo más tarde.');
      this.notificationService.error('Error al procesar la solicitud');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Navega de vuelta al login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navega al inicio
   */
  goToHome(): void {
    this.router.navigate(['/']);
  }

  // ===================================
  // FORM VALIDATION HELPERS
  // ===================================

  /**
   * Verifica si un campo tiene errores y ha sido tocado
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'Por favor, ingresa tu correo electrónico';
    }
    
    if (field.errors['email']) {
      return 'Por favor, ingresa un correo electrónico válido';
    }

    return 'Campo inválido';
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  // ===================================
  // MESSAGE HANDLERS
  // ===================================

  /**
   * Muestra mensaje de éxito
   */
  private showSuccessMessage(message: string): void {
    this.successMessage.set(message);
    this.showSuccess.set(true);
    this.showError.set(false);
  }

  /**
   * Muestra mensaje de error
   */
  private showErrorMessage(message: string): void {
    this.errorMessage.set(message);
    this.showError.set(true);
    this.showSuccess.set(false);
  }

  /**
   * Oculta todos los mensajes
   */
  private hideMessages(): void {
    this.showSuccess.set(false);
    this.showError.set(false);
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  /**
   * Genera un token de recuperación único
   */
  private generateResetToken(): string {
    return 'reset_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Simula delay de API
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}