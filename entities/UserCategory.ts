import { v4 as uuid_v4 } from "uuid";
import { Permition } from "./Permition";

export class UserCategory{
  public id: string = uuid_v4();
  public slug: string
  public name: string
  public description?: string  
  public clientId : string
  public permitions?: Permition[]

  constructor(props: Omit<UserCategory,"id">, id?: string){
    Object.assign(this,props);
    
    if(id) this.id = id
  }
}