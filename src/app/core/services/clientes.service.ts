import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Cliente, ClienteMutationResponse, ClientePayload } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);

  getClientes(): Observable<Cliente[]> {
    console.info('[ClientesService] Solicitando listado de clientes.');

    return this.http.get<Cliente[]>(`${environment.apiUrl}/clientes`).pipe(
      tap((clientes) =>
        console.info(`[ClientesService] Listado recibido con ${clientes.length} clientes.`),
      ),
      catchError((error) => {
        console.error('[ClientesService] Error al obtener clientes.', error);
        return throwError(() => error);
      }),
    );
  }

  getClienteById(id: number): Observable<Cliente> {
    console.info(`[ClientesService] Solicitando cliente ${id}.`);

    return this.http.get<Cliente>(`${environment.apiUrl}/clientes/${id}`).pipe(
      tap(() => console.info(`[ClientesService] Cliente ${id} recibido.`)),
      catchError((error) => {
        console.error(`[ClientesService] Error al obtener el cliente ${id}.`, error);
        return throwError(() => error);
      }),
    );
  }

  createCliente(payload: ClientePayload): Observable<ClienteMutationResponse> {
    console.info('[ClientesService] Creando cliente.', payload);

    return this.http
      .post<ClienteMutationResponse>(`${environment.apiUrl}/clientes`, payload)
      .pipe(
        tap((response) =>
          console.info(`[ClientesService] Cliente creado correctamente con id ${response.id}.`),
        ),
        catchError((error) => {
          console.error('[ClientesService] Error al crear cliente.', error);
          return throwError(() => error);
        }),
      );
  }

  updateCliente(id: number, payload: ClientePayload): Observable<ClienteMutationResponse> {
    console.info(`[ClientesService] Actualizando cliente ${id}.`, payload);

    return this.http
      .put<ClienteMutationResponse>(`${environment.apiUrl}/clientes/${id}`, payload)
      .pipe(
        tap(() => console.info(`[ClientesService] Cliente ${id} actualizado correctamente.`)),
        catchError((error) => {
          console.error(`[ClientesService] Error al actualizar el cliente ${id}.`, error);
          return throwError(() => error);
        }),
      );
  }

  deleteCliente(id: number): Observable<ClienteMutationResponse> {
    console.info(`[ClientesService] Eliminando cliente ${id}.`);

    return this.http
      .delete<ClienteMutationResponse>(`${environment.apiUrl}/clientes/${id}`)
      .pipe(
        tap(() => console.info(`[ClientesService] Cliente ${id} eliminado correctamente.`)),
        catchError((error) => {
          console.error(`[ClientesService] Error al eliminar el cliente ${id}.`, error);
          return throwError(() => error);
        }),
      );
  }
}
