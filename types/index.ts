export * from "./notification.type";
import { NotificationTypes } from "./notification.type";
import { NotificationPreference } from "../entities/NotificationPreference";
import { NotificationGroup } from "../entities/NotificationGroup";
import { Notification } from "../entities/Notification";
import { User } from "../entities/User";

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
export interface ResponseGetTenantIdAndOwnerIdByFlowId extends ResultAndResponse{
  data?: { tenant_id: string, owner_id: string }
}
export interface SimpleAuthenticatedCommunication{
  sendNotifications(notification_ids: string[]): Promise<void>;
  getUsersWithFlowPermission(flow_id: string, flow_perms: string[]): Promise<ResponseUsers>;
  getFlowAuthsWithPreference(flow_id: string, user_ids?: string[], all?: boolean): Promise<ResponseUsers>;
  getTenantIdAndOwnerIdByFlowId(flow_id: string) : Promise<ResponseGetTenantIdAndOwnerIdByFlowId>
}
export interface SimpleNotificationCacheMemoryRepository{
  clearCache(user_id: string, client_id: string, flow_id?: string) : void
}
//#endregion SIMPLE REPOSITORIES
//#region ENTITIES
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
export interface UserCategoriesOnUsers {
  userCategoryId: string,
  userId: string
}
//#endregion ENTITIES
export interface ResultAndResponse{
  result: boolean,
  response: string
}