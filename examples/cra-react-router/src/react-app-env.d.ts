declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_DOMAIN: string;
    REACT_APP_CLIENT_ID: string;
    REACT_APP_AUDIENCE: string;
    REACT_APP_API_PORT: number;
  }
}
