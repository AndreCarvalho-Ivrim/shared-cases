import { IShortClientRepository } from "../../types/client.type";

export class FindClientUseCase {
    constructor(private repository: IShortClientRepository){}

    async execute(id: string){
        const alreadyExists = await this.repository.findById(id);

        if (!alreadyExists){
            throw new Error("Client does not exist");
        }

        alreadyExists.users = alreadyExists.users.map((user) => {
            user.userCategory = (user as any).userCategories.find(
                (category) => category.userCategory.clientId === alreadyExists.id
            )?.userCategory;
            delete user.userCategories;
            return user;
        });

        return alreadyExists;
    }
}