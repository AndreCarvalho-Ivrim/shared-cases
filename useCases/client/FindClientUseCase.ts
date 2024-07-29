import { IShortClientRepository } from "../../types/client.type";

export class FindClientUseCase {
  constructor(private repository: IShortClientRepository){}

  async execute(id: string){
    const alreadyExists = await this.repository.findById(id);

    if (!alreadyExists) throw new Error("Cliente não encontrado");

    return alreadyExists;
  }
}