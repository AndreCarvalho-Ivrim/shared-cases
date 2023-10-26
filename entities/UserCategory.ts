import { v4 as uuid_v4 } from "uuid";
import { Permition } from "./Permition";

export class UserCategory{
  id: string
  slug: string
  name: string
  description?: string  
  clientId : string
  permitions?: Permition[]

  constructor(props: Omit<UserCategory,"id">, id?: string){
    Object.assign(this,props);
    
    if (!id){
      this.id = uuid_v4();
    }

  }
}