export interface Cliente {
  id: number;
  nombre: string;
  correoElectronico: string;
  telefono: string;
  estatus: boolean;
}

export interface ClientePayload {
  nombre: string;
  correoElectronico: string;
  telefono: string;
  estatus: boolean;
}

export interface ClienteMutationResponse {
  id?: number;
  mensaje: string;
}
