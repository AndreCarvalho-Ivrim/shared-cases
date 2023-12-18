import { v4 as uuid_v4 } from "uuid";
import { NotificationToTypes } from "../types";

export class NotificationGroup{
  public readonly id?: string
  public type: NotificationToTypes
  public client_id?: string
  public flow_id?: string
  public data?: string
  public owner_id?: string
  public created_at?: Date
  public updated_at?: Date
  public is_hub?: boolean

  constructor(props: Omit<NotificationGroup, "id">, id?: string) {
    Object.assign(this, props);

    if(!id) this.id = uuid_v4();
    else this.id = id;

    if(!props.created_at) this.created_at = new Date()
    if(!props.updated_at) this.updated_at = new Date()
  }
}