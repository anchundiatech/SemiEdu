// Almacén de tokens en memoria (similar al repo de referencia)
// En producción, esto debería ser Redis o base de datos

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string;
  token_type?: string;
}

class TokenStore {
  private tokens: Map<string, TokenData> = new Map();

  // Guardar tokens para un usuario
  setTokens(userId: string, tokens: TokenData): void {
    console.log(`📦 Guardando tokens para usuario: ${userId}`);
    this.tokens.set(userId, {
      ...tokens,
      expires_at: tokens.expires_at || Date.now() + 3600000 // 1 hora por defecto
    });
  }

  // Obtener tokens de un usuario
  getTokens(userId: string): TokenData | null {
    const tokens = this.tokens.get(userId);
    if (!tokens) {
      console.log(`❌ No se encontraron tokens para usuario: ${userId}`);
      return null;
    }

    // Verificar si el token ha expirado
    if (tokens.expires_at && tokens.expires_at < Date.now()) {
      console.log(`⏰ Token expirado para usuario: ${userId}`);
      this.tokens.delete(userId);
      return null;
    }

    console.log(`✅ Tokens encontrados para usuario: ${userId}`);
    return tokens;
  }

  // Eliminar tokens de un usuario
  deleteTokens(userId: string): void {
    console.log(`🗑️ Eliminando tokens para usuario: ${userId}`);
    this.tokens.delete(userId);
  }

  // Verificar si un usuario tiene tokens válidos
  hasValidTokens(userId: string): boolean {
    return this.getTokens(userId) !== null;
  }

  // Obtener todos los usuarios con tokens (para debug)
  getAllUsers(): string[] {
    return Array.from(this.tokens.keys());
  }

  // Limpiar tokens expirados
  cleanExpiredTokens(): void {
    const now = Date.now();
    const entries = Array.from(this.tokens.entries());
    for (const [userId, tokens] of entries) {
      if (tokens.expires_at && tokens.expires_at < now) {
        console.log(`🧹 Limpiando token expirado para usuario: ${userId}`);
        this.tokens.delete(userId);
      }
    }
  }
}

// Instancia singleton
export const tokenStore = new TokenStore();

// Limpiar tokens expirados cada 10 minutos
setInterval(() => {
  tokenStore.cleanExpiredTokens();
}, 10 * 60 * 1000);

export type { TokenData };
