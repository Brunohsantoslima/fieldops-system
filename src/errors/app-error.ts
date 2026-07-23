export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: Record<string, unknown>;

  // Agora a ordem é: mensagem, statusCode, código FLX e detalhes
  constructor(message: string, statusCode = 400, code = 'FLX_ERROR', details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}