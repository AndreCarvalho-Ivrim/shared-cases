import { Client } from "../entities/Client";
import { User } from "../entities/User";

export interface Deadline {
  id: string,
  clientId: string,
  stageSlug: string,
  days: number,
  active: boolean,
}

export interface UserCategoryType {
  id: string,
  slug?: string,
  name: string,
  description: string,
  depth: string,
  clientId?: string,
  userCategory?: any,
}

export type UserShortClient = Omit<User, 'userCategories'>
export interface UserWithUserCategoryType extends UserShortClient {
  userCategories?: Omit<UserCategoryType, 'id' | 'name' | 'description' | 'depth'>[]
  userCategory?: Omit<UserCategoryType, 'id' | 'name' | 'description' | 'depth'>[]
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
  deadlines?: Pick<Deadline, 'stageSlug' | 'days'>[]
} 

export interface IShortClientRepository {
  findById(id: string): Promise<ShortClientType>;
  findClients(client_ids: string[]): Promise<Client[]>;
}