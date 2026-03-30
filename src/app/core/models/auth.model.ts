export interface LoginCredentials {
  nombreUsuario: string;
  contrasena: string;
}

export interface AuthSession {
  id: number;
  nombreUsuario: string;
  token: string;
}
