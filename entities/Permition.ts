import { v4 as uuid_v4 } from "uuid";
import { UserCategory } from "./UserCategory";

export class Permition{
  public readonly id: string = uuid_v4();
  public name: string
  public slug: string
  public description: string
  public userCategories?: UserCategory[]
  
  constructor(props: Omit<Permition, 'id'>,id?: string){
    Object.assign(this,props);

    if(id) this.id = id;
  }
}