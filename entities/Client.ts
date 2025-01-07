import { v4 as uuid_v4 } from "uuid";
import { User } from "./User";

export const clientFields : Record<keyof Omit<Client, 'id' | 'deadlines' | 'users'>, true> = {
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
  economic_group: true,
  dedicated_server: true
}

export class Client {
  public readonly id: string = uuid_v4();
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
  public economic_group? : string
  public dedicated_server?: string
  public ddd: string
  public telefone: string
  public email: string

  public users? : User[]

  constructor(props: Omit<Client, 'id'>, id?: string) {
    Object.assign(this, props);
    if(id) this.id = id
    if(!this.users) this.users = [];
  }
}