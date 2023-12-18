import { v4 as uuid_v4 } from "uuid";
import { NotificationToTypes, NotificationTypes } from "../types";

export class Notification {
  public readonly id?: string
  public title: string
  public type: NotificationTypes
  public icon?: string
  public description: string
  public to: NotificationToTypes
  public notification_group_id?: string
  public viewed?: boolean
  public schedule?: Date
  public user_id: string
  public client_id?: string
  public flow_id?: string
  public redirect_to?: string
  public template_ids?: string
  public template_datas?: string
  public is_archived?: boolean
  public notify_by: string
  public error_notify?: string
  public is_sended?: boolean
  public priority?: number
  public owner_id?: string
  public external_id?: string
  public created_at?: Date
  public updated_at?: Date

  public is_hub?: boolean

  constructor(props: Omit<Notification, "id">, id?: string) {
    Object.assign(this, props);

    if(!id) this.id = uuid_v4();
    else this.id = id;

    if(!props.created_at) this.created_at = new Date()
    if(!props.updated_at) this.updated_at = new Date()
  }
}