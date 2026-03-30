import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ClientePayload } from '../../../core/models/cliente.model';
import { ClientesService } from '../../../core/services/clientes.service';

@Component({
  selector: 'app-cliente-form',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.scss',
})
export class ClienteForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly clientesService = inject(ClientesService);

  // Usamos signals para que los estados async del formulario actualicen la vista.
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly clienteForm = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    correoElectronico: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
    estatus: [true, Validators.required],
  });

  protected get clienteId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  protected get isEditMode(): boolean {
    return this.clienteId !== null;
  }

  ngOnInit(): void {
    if (!this.isEditMode) {
      return;
    }

    const id = Number(this.clienteId);

    if (Number.isNaN(id)) {
      this.errorMessage.set('El identificador del cliente no es valido.');
      return;
    }

    this.isLoading.set(true);
    this.clientesService
      .getClienteById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (cliente) => {
          this.clienteForm.setValue({
            nombre: cliente.nombre,
            correoElectronico: cliente.correoElectronico,
            telefono: cliente.telefono,
            estatus: cliente.estatus,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.mensaje ?? 'No fue posible cargar el cliente.');
        },
      });
  }

  protected submit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const payload: ClientePayload = this.clienteForm.getRawValue();

    if (this.isEditMode) {
      this.updateCliente(payload);
      return;
    }

    this.createCliente(payload);
  }

  protected hasError(
    controlName: 'nombre' | 'correoElectronico' | 'telefono' | 'estatus',
  ): boolean {
    const control = this.clienteForm.controls[controlName];
    return control.invalid && control.touched;
  }

  private createCliente(payload: ClientePayload): void {
    this.clientesService
      .createCliente(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) => {
          console.info(`[ClienteForm] Cliente creado con id ${response.id}.`);
          void this.router.navigateByUrl('/clientes');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.mensaje ?? 'No fue posible crear el cliente.');
        },
      });
  }

  private updateCliente(payload: ClientePayload): void {
    const id = Number(this.clienteId);

    this.clientesService
      .updateCliente(id, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          console.info(`[ClienteForm] Cliente ${id} actualizado.`);
          void this.router.navigateByUrl('/clientes');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.mensaje ?? 'No fue posible actualizar el cliente.');
        },
      });
  }
}
