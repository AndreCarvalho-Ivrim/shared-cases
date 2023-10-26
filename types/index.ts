//#region SIMPLE REPOSITORIES
export interface SimpleUserRepository{
  findUsers(): Promise<User[]>;
  findAllUsers(client_id: string): Promise<User[]>
  findUsersInId(users_id: string[]): Promise<User[]>;
}
export interface SimpleNotificationRepository{
  create(data: Notification): Promise<Notification>;
}
export interface SimpleNotificationGroupRepository{
  create(data: NotificationGroup): Promise<NotificationGroup>;
}
export interface IUsersPermitions {
  userId: string;
  email: string;
  sms: string;
  whatsapp: string;
} 
export interface SimpleUserCategoryPermitionRepository{
  findRelationsSlugByPermitions(permition_slugs: string[]): Promise<IUsersPermitions[]>;
}
export interface SimpleUserCategoriesOnUsersRepository{
  findRelationsSlugByUserCategory(category_slugs: string[]): Promise<UserCategoriesOnUsers[]>;
}
export interface SimpleNotificationPreferenceRepository{
  findByUserId(user_ids: string[]): Promise<NotificationPreference[]>;
}
export interface SimpleAuthenticatedCommunication{
  sendNotifications(notification_ids: string[]): Promise<void>;
  getUsersWithFlowPermission(flow_id: string, flow_perms: string[]): Promise<ResponseUsers>;
  getFlowAuthsWithPreference(flow_id: string, user_ids?: string[], all?: boolean): Promise<ResponseUsers>;
}
export interface SimpleNotificationCacheMemoryRepository{
  clearCache(user_id: string, client_id: string, flow_id?: string)
}
//#endregion SIMPLE REPOSITORIES
//#region ENTITIES
export interface User{
  id: string;
  email: string;
  password: string;
  picture: string;
  active: boolean;
  currentClientId: string;
  name: string;
  whatsapp?: string;
  clients?: Client[];
  // -- ignorado tipagem real por baixa relevância
  costCenter?: any;
  location?: string;
  costCenterId?: string;
  userCategories?: UserCategory[];
}
export interface Client {
  id: string
  cnpj: string
  razao_social: string
  nome_fantasia: string
  picture: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  // -- ignorado tipagem real por baixa relevância
  deadlines?: any[]
  ddd: string
  telefone: string
  email: string
}
export interface UserCategory{
  id: string
  slug: string | null
  name: string | null
  description: string | null
  clientId: string | null
}
export interface Notification{
  id?: string
  title: string
  type: NotificationTypes
  icon?: string
  description: string
  to: NotificationToTypes
  notification_group_id?: string
  viewed?: boolean
  schedule?: Date
  user_id: string
  client_id?: string
  flow_id?: string
  redirect_to?: string
  template_ids?: string
  template_datas?: string
  is_archived?: boolean
  notify_by: string
  error_notify?: string
  is_sended?: boolean
  priority?: number
  owner_id?: string
  is_hub?: boolean
}
export interface NotificationGroup{
  id?: string
  type: NotificationToTypes
  client_id?: string
  flow_id?: string
  data?: string
  owner_id?: string
  is_hub?: boolean
}
export type NotificationToTypes = 'broadcast_hub' | 'broadcast' | 'broadcast_flow_auth' | 'hub_perms' | 'flow_perms' | 'hub_ids' | 'flow_auth_ids';
export type NotificationTypes = 'update' | 'mention' | 'alert' | 'reminder' | 'license';
export interface UserCategoriesOnUsers {
  userCategoryId: string,
  userId: string
}
export interface NotificationPreference{
  id?: string
  user_id: string
  client_id?: string
  flow_id?: string
  notify_by: string
  auto_archive_type: string
}
export interface ResponseUsers extends ResultAndResponse{
  data?: {
    id: string,
    name: string,
    email: string,
    picture: string,
    whatsapp: string
    preference?: {
      type: NotificationTypes,
      plataform?: boolean,
      email?: boolean,
      sms?: boolean,
      whatsapp?: boolean,
      is_archived?: boolean
    }[]
  }[]
}
//#endregion ENTITIES
export interface ResultAndResponse{
  result: boolean,
  response: string
}