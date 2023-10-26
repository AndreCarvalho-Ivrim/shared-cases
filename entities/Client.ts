import { v4 as uuid_v4 } from "uuid";

export const clientFields : Record<keyof Omit<Client, 'id' | 'deadlines'>, true> = {
  cnpj: true,
  razao_social: true,
  nome_fantasia: true,
  picture: true,

  cep: true,
  logradouro: true,
  numero: true,
  bairro: true,
  cidade: true,
  estado: true,

  ddd: true,
  telefone: true,
  email: true,
}

export class Client {
  public readonly id: string
  public cnpj: string
  public razao_social: string
  public nome_fantasia: string
  public picture: string

  public cep: string
  public logradouro: string
  public numero: string
  public bairro: string
  public cidade: string
  public estado: string

  public ddd: string
  public telefone: string
  public email: string

  constructor(props: Omit<Client, 'id'>, id?: string) {
    Object.assign(this, props);
    if(!id) this.id = uuid_v4();
  }
}