import { v4 as uuid_v4 } from "uuid";

export class NotificationPreference{
  public readonly id?: string
  public user_id: string
  public client_id?: string
  public flow_id?: string
  public notify_by: string
  public auto_archive_type: string

  constructor(props: Omit<NotificationPreference, "id">, id?: string) {
    Object.assign(this, props);

    if(!id) this.id = uuid_v4();
    else this.id = id;
  }
}