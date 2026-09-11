export interface LoginFields {
  email?: string;
  password?: string;
  securityCode?: string;
}

export interface RegisterFields extends Partial<LoginFields> {
  username?: string;
}

export interface DecodedJWT {
  /**
   * **sub is 'id' of the user**
   */
  sub: string;
  email: string;
  username: string;
  role: string;
}

export interface UserDTOResponse {
  id: string;
  email: string;
  username: string;
  role: string;
}

export type LoginAndRegisterResponse = UserDTOResponse;

