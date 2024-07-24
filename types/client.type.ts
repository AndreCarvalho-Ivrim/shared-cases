import { Client } from "../entities/Client";
import { User } from "../entities/User"
import { UserCategory } from "../entities/UserCategory"

interface UserWithUserCategoryType extends User {
  userCategory?: UserCategory
}

export interface ShortClientType {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  ddd: string;
  telefone: string;
  email: string;
  picture?: string;
  economic_group?: string;
  users?: UserWithUserCategoryType[];
} 

export interface IShortClientRepository {
  findById(id: string): Promise<ShortClientType>;
  findClients(client_ids: string[]): Promise<Client[]>;
}