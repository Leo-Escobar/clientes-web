import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Cliente } from '../../../core/models/cliente.model';
import { ClientesService } from '../../../core/services/clientes.service';

@Component({
  selector: 'app-clientes-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './clientes-list.html',
  styleUrl: './clientes-list.scss',
})
export class ClientesList implements OnInit {
  private readonly clientesService = inject(ClientesService);

  // Usamos signals para que la vista se refresque cuando responden las llamadas HTTP.
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly filteredClientes = signal<Cliente[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly totalClientes = computed(() => this.clientes().length);
  protected readonly totalActivos = computed(
    () => this.clientes().filter((cliente) => cliente.estatus).length,
  );
  protected readonly totalInactivos = computed(
    () => this.clientes().filter((cliente) => !cliente.estatus).length,
  );
  protected searchTerm = '';

  ngOnInit(): void {
    this.loadClientes();
  }

  protected loadClientes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.clientesService
      .getClientes()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (clientes) => {
          this.clientes.set(clientes);
          this.applyFilter();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.mensaje ?? 'No fue posible cargar los clientes.');
        },
      });
  }

  protected applyFilter(): void {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      this.filteredClientes.set([...this.clientes()]);
      return;
    }

    this.filteredClientes.set(
      this.clientes().filter((cliente) =>
        [cliente.nombre, cliente.correoElectronico, cliente.telefono].some((value) =>
          value.toLowerCase().includes(normalizedTerm),
        ),
      ),
    );
  }

  protected deleteCliente(cliente: Cliente): void {
    const confirmed = confirm(`Se eliminara el cliente "${cliente.nombre}".`);

    if (!confirmed) {
      return;
    }

    this.deletingId.set(cliente.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.clientesService
      .deleteCliente(cliente.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.mensaje);
          this.loadClientes();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.mensaje ?? 'No fue posible eliminar el cliente.');
        },
      });
  }
}
