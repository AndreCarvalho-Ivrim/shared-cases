import { v4 as uuid_v4 } from "uuid";
import { Client } from "./Client";
import { UserCategory } from "./UserCategory";

export class User {    
  public readonly id: string = uuid_v4();
  public email: string;
  public password: string;
  public picture: string;
  public active: boolean;
  public currentClientId: string;
  public name: string;
  public whatsapp?: string;
  public clients?: Client[];
  public location?: string;
  public costCenterId?: string;
  public userCategories?: UserCategory[];

  constructor(props: Omit<User, 'id'>, id?: string){
    Object.assign(this, props);
    if(id) this.id = id;
  }
}
